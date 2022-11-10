import inspect
from base64 import b85decode, b85encode
from functools import partial

# max_buffer_size=100MB
import msgpack
import msgpack_numpy as mpn
import numpy as np
import orjson
from fastapi import Request, Response
from pydantic import BaseModel

from .custom_types import asdict as _asdict

mpn.patch()


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


mp_unpackb = msgpack.unpackb
mp_packb = msgpack.packb


def _walk_msg(msg, visitor):
    if isinstance(msg, dict):
        for k, v in msg.items():
            msg[k] = _walk_msg(v, visitor)
    elif isinstance(msg, (list, tuple)):
        return [_walk_msg(v, visitor) for v in msg]
    return visitor(msg)


def _replace_ndarray_visitor(data_as_str: bool, v):
    if isinstance(v, np.ndarray):
        kind = v.dtype.kind
        if kind == "i":  # reduce integer array byte size if possible
            vmin = v.min()
            if vmin >= 0:
                kind = "u"
            else:
                vmax = v.max()
                minmax_type = [np.min_scalar_type(vmin), np.min_scalar_type(vmax)]
                if minmax_type[1].kind == "u":
                    isize = minmax_type[1].itemsize
                    stype = np.dtype(f"i{isize}")
                    if isize == 8 and vmax > np.iinfo(stype).max:
                        minmax_type[1] = np.float64
                    else:
                        minmax_type[1] = stype
                v = v.astype(np.promote_types(*minmax_type))
        if kind == "u":
            v = v.astype(np.min_scalar_type(v.max()))
        data = v.data.tobytes()
        if data_as_str:
            data = b85encode(data).decode()
        return dict(nd=True, dtype=v.dtype.str, shape=v.shape, data=data)
    return v


def _replace_nddict_visitor(v):
    if isinstance(v, dict):
        if all(i in v for i in ("nd", "dtype", "shape", "data")) and v["nd"]:
            data = v["data"]
            if isinstance(data, str):
                data = b85decode(data.encode())
            return np.ndarray(buffer=data, shape=v["shape"], dtype=v["dtype"])
    return v


def ws_deserialize_ndarray(msg):
    """websocket message deserialize dictionaries that represent ndarrays

    Does the reverse of ws_asdict
    """
    return _walk_msg(msg, _replace_nddict_visitor)


def ws_asdict(msg, data_as_str=False):
    """websocket friendly dictionary

    Replaces ndarrays in message with a dictionary
    {
      nd:boolean,
      dtype:string,
      shape: int[],
      data: byte[], # or str if data_as_str is True
    }
    """
    data = _asdict(msg)
    return _walk_msg(data, partial(_replace_ndarray_visitor, data_as_str))


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
        unpacker = mp_unpackb if ct == _MESSAGE_PACK else j_loads
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
        packer = mp_packb if ac == _MESSAGE_PACK else j_dumps
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
