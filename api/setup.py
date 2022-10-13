import os

from setuptools import setup, find_packages
from setuptools.command.install import install
from subprocess import check_call

#from Davidia import __version__
__version__ = '0.0.1'

setup(
    name='Davidia',
    version=__version__,
    description='Plot server with React frontend data visualiser',
    author_email="dataanalysis@diamond.ac.uk",
    packages=find_packages(),
    install_requires=['fastapi', 'websockets', 'requests',
                      'msgpack-python', 'msgpack-asgi', 'pytest', 'pytest-asyncio', 'httpx', 'uvicorn',
                      'py-ts-interfaces'],
    url='https://github.com/DiamondLightSource/davidia',
)


class PreInstallCommand(install):
    """Pre-installation for installation mode."""
    def run(self):
        check_call(f"py-ts-interfaces {os.path.join('api', 'plot', 'custom_types.py')} -o main.d.ts".split())
        install.run(self)
