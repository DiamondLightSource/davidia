import inspect
from typing import Any

import numpy as np
import orjson
from fastapi import Request, Response
from msgpack import packb as _mp_packb  # max_buffer_size=100MB
from msgpack import unpackb as _mp_unpackb
from pydantic import BaseModel

from ..models.messages import ALL_MODELS, DvDNDArray
from ..models.selections import as_selection


def as_model(raw: dict) -> BaseModel | None:
    for m in ALL_MODELS:
        try:
            return m.model_validate(raw)
        except Exception:
            pass
    return None


def j_dumps(data, default=None) -> bytes:
    if isinstance(data, BaseModel):
        return data.model_dump_json().encode()

    d = orjson.dumps(
        data,
        default=default,
        option=orjson.OPT_SERIALIZE_NUMPY,
    )
    return d


def _deserialize_selection(item):
    if isinstance(item, (tuple, list)):
        return [_deserialize_selection(i) for i in item]
    elif isinstance(item, dict):
        if "id" in item and "start" in item:
            return as_selection(item)
    return item


def _deserialize_any(item):
    if isinstance(item, dict):
        m = as_model(item)
        return _deserialize_selection(item) if m is None else m
    elif isinstance(item, list):
        return [_deserialize_any(i) for i in item]
    return item


def j_loads(data):
    d = orjson.loads(data)
    return _deserialize_any(d)


def decode_ndarray(obj) -> DvDNDArray:
    if isinstance(obj, dict):
        if all(i in obj for i in ("nd", "dtype", "shape", "data")) and obj["nd"]:
            obj = np.ndarray(buffer=obj["data"], shape=obj["shape"], dtype=obj["dtype"])
    return obj  # pyright: ignore[reportGeneralTypeIssues]


def encode_ndarray(obj) -> dict[str, Any]:
    if isinstance(obj, np.ndarray):
        kind = obj.dtype.kind
        if kind == "i":  # reduce integer array byte size if possible
            vmin = obj.min() if obj.size > 0 else 0
            if vmin >= 0:
                kind = "u"
            else:
                vmax = obj.max() if obj.size > 0 else 0
                minmax_type = [np.min_scalar_type(vmin), np.min_scalar_type(vmax)]
                if minmax_type[1].kind == "u":
                    isize = minmax_type[1].itemsize
                    stype = np.dtype(f"i{isize}")
                    if isize == 8 and vmax > np.iinfo(stype).max:
                        minmax_type[1] = np.dtype(np.float64)
                    else:
                        minmax_type[1] = stype
                obj = obj.astype(np.promote_types(*minmax_type))
        if kind == "u":
            obj = obj.astype(np.min_scalar_type(obj.max() if obj.size > 0 else 0))
        obj = dict(
            nd=True, dtype=obj.dtype.str, shape=obj.shape, data=obj.data.tobytes()
        )
    return obj


def ws_pack(obj) -> bytes | None:
    """Pack object for a websocket message

    Packs object by converting Pydantic models and ndarrays to dicts before
    using MessagePack
    """
    if isinstance(obj, BaseModel):
        obj = obj.model_dump(by_alias=True)
    return _mp_packb(obj, default=encode_ndarray)


def ws_unpack(obj: bytes) -> dict[str, Any]:
    """Unpack a websocket message as a dict

    Unpacks MessagePack object to dict (deserializes NumPy ndarrays)
    """
    return _mp_unpackb(obj, object_hook=decode_ndarray)


_MESSAGE_PACK = "application/x-msgpack"


def message_unpack(func):
    """
    Use with router function:
    @app.get('/')
    @message_unpack
    async def root_request(payload: MyModel) -> OtherModel:
        ...
    """
    f_params = inspect.get_annotations(func, eval_str=True)
    f_class = f_params.pop("return")

    def _instantiate_obj(model_class, obj):
        if isinstance(obj, BaseModel):
            return obj
        elif hasattr(model_class, "model_validate"):
            return model_class.model_validate(obj)
        return model_class(**obj)

    async def wrapper(request: Request) -> Response:
        ct = request.headers.get("Content-Type")
        unpacker = ws_unpack if ct == _MESSAGE_PACK else j_loads
        body = await request.body()
        unpacked = unpacker(body)
        if len(f_params) == 1:
            kwargs = {k: _instantiate_obj(v, unpacked) for k, v in f_params.items()}
        else:
            kwargs = {
                # TODO something about missing parameters or extra items in unpacked
                k: _instantiate_obj(
                    v,
                    unpacked[k],  # pyright: ignore[reportGeneralTypeIssues]
                )
                for k, v in f_params.items()
                if k in unpacked  # pyright: ignore[reportGeneralTypeIssues]
            }

        response = await func(**kwargs)
        if type(response) != f_class:
            raise ValueError(
                f"Return value was not expected type {type(response)} cf {f_class}"
            )

        ac = request.headers.get("Accept")
        packer = ws_pack if ac == _MESSAGE_PACK else j_dumps
        if isinstance(response, Response):
            packed = packer(response.body)
            if packed is not None:
                response.body = packed
        else:
            if isinstance(response, BaseModel):
                response = response.model_dump(by_alias=True)
            response = Response(content=packer(response), media_type=ac)
        return response

    wrapper.__name__ = func.__name__
    wrapper.__doc__ = func.__doc__
    return wrapper
