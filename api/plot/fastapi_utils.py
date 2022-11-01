from fastapi import Request, Response
from pydantic import BaseModel

import inspect

import orjson

# max_buffer_size=100MB
import msgpack
import msgpack_numpy as mpn

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
                k: _instantiate_obj(  # TODO something about missing parameters
                    v, unpacked[k]    # or extra items in unpacked
                )
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
