from setuptools import find_packages, setup

# from Davidia import __version__
__version__ = "0.0.1"


setup(
    name="Davidia",
    version=__version__,
    description="Plot server with React frontend data visualiser",
    author_email="dataanalysis@diamond.ac.uk",
    packages=find_packages(),
    python_requires=">=3.10",
    install_requires=[
        "before-after",
        "fastapi",
        "httpx",
        "msgpack",
        "pillow",
        "pydantic-numpy",
        "orjson-pydantic",
        "requests",
        "uvicorn",
        "websockets",
    ],
    extras_requires={
        "test": [
            "pytest",
            "pytest-asyncio",
        ],
    },
    url="https://github.com/DiamondLightSource/davidia",
)
