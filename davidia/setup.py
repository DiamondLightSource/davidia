from setuptools import find_packages, setup

# from Davidia import __version__
__version__ = "0.0.1"


setup(
    name="Davidia",
    version=__version__,
    description="Plot server with React frontend data visualiser",
    author_email="dataanalysis@diamond.ac.uk",
    packages=find_packages(),
    install_requires=[
        "before-after"
        "fastapi",
        "httpx",
        "msgpack",
        "orjson-pydantic",
        "pytest",
        "pytest-asyncio",
        "requests",
        "uvicorn",
        "websockets",
    ],
    url="https://github.com/DiamondLightSource/davidia",
)
