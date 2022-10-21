from setuptools import setup, find_packages


# from Davidia import __version__
__version__ = '0.0.1'


setup(
    name='Davidia',
    version=__version__,
    description='Plot server with React frontend data visualiser',
    author_email="dataanalysis@diamond.ac.uk",
    packages=find_packages(),
    install_requires=[
        'fastapi',
        'httpx',
        'msgpack-numpy',
        'orjson-pydantic',
        'py-ts-interfaces',
        'pytest'
        'pytest-asyncio',
        'requests',
        'uvicorn',
        'websockets',
        ],
    url='https://github.com/DiamondLightSource/davidia',
)
