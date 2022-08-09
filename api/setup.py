from setuptools import setup, find_packages

from Davidia import __version__

setup(
    name='Davidia',
    version=__version__,
    description='Plot server with React frontend data visualiser',
    author_email="dataanalysis@diamond.ac.uk",
    packages=find_packages(),
    install_requires=['fastapi', 'httpx', 'msgpack-python', 'pytest'],
    url='https://github.com/DiamondLightSource/davidia',
)
