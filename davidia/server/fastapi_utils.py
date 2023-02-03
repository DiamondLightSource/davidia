import inspect

import numpy as np
import orjson
from fastapi import Request, Response

# max_buffer_size=100MB
from msgpack import packb as _mp_packb
from msgpack import unpackb as _mp_unpackb
from pydantic import BaseModel


def j_dumps(data, default=None):
    d = orjson.dumps(
        data,
        default=default,
        option=orjson.OPT_SERIALIZE_PYDANTIC | orjson.OPT_SERIALIZE_NUMPY,
    ).decode()
    return d


def j_loads(data):
    d = orjson.loads(data)
    return d


def decode_ndarray(obj):
    if isinstance(obj, dict):
        if all(i in obj for i in ("nd", "dtype", "shape", "data")) and obj["nd"]:
            obj = np.ndarray(buffer=obj["data"], shape=obj["shape"], dtype=obj["dtype"])
    return obj


def encode_ndarray(obj):
    if isinstance(obj, np.ndarray):
        kind = obj.dtype.kind
        if kind == "i":  # reduce integer array byte size if possible
            vmin = obj.min()
            if vmin >= 0:
                kind = "u"
            else:
                vmax = obj.max()
                minmax_type = [np.min_scalar_type(vmin), np.min_scalar_type(vmax)]
                if minmax_type[1].kind == "u":
                    isize = minmax_type[1].itemsize
                    stype = np.dtype(f"i{isize}")
                    if isize == 8 and vmax > np.iinfo(stype).max:
                        minmax_type[1] = np.float64
                    else:
                        minmax_type[1] = stype
                obj = obj.astype(np.promote_types(*minmax_type))
        if kind == "u":
            obj = obj.astype(np.min_scalar_type(obj.max()))
        obj = dict(
            nd=True, dtype=obj.dtype.str, shape=obj.shape, data=obj.data.tobytes()
        )
    return obj


def ws_pack(obj):
    """Pack object for a websocket message

    Packs object by converting Pydantic models and ndarrays to dicts before
    using MessagePack
    """
    if isinstance(obj, BaseModel):
        obj = obj.dict()
    return _mp_packb(obj, default=encode_ndarray)


def ws_unpack(obj: bytes):
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
        if isinstance(model_class, BaseModel):
            return model_class.parse_obj(obj)
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
                k: _instantiate_obj(v, unpacked[k])
                for k, v in f_params.items()
                if k in unpacked
            }

        response = await func(**kwargs)
        if type(response) != f_class:
            raise ValueError(
                f"Return value was not expected type {type(response)} cf {f_class}"
            )

        ac = request.headers.get("Accept")
        packer = ws_pack if ac == _MESSAGE_PACK else j_dumps
        if isinstance(response, Response):
            response.body = packer(response.body)
        else:
            if isinstance(response, BaseModel):
                response = response.dict()
            response = Response(content=packer(response), media_type=ac)
        return response

    wrapper.__name__ = func.__name__
    wrapper.__doc__ = func.__doc__
    return wrapper
