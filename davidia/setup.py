import os
from setuptools import find_packages, setup

# from Davidia import __version__
__version__ = "0.1.0"


def find_readme():
    current_dir = os.path.abspath(os.path.dirname(__file__))
    path = os.path.join(current_dir, "README.md")
    if os.path.exists(path):
        return path

    raise FileNotFoundError(f"README.md not found in {current_dir}")


readme_path = find_readme()


setup(
    name="Davidia",
    version=__version__,
    description="Plot server with React frontend data visualiser",
    long_description=open(readme_path).read(),
    long_description_content_type="text/markdown",
    package_data={"": [readme_path]} if readme_path else {},
    include_package_data=True,
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
    extras_require={
        "test": [
            "pytest",
            "pytest-asyncio",
        ],
    },
    url="https://github.com/DiamondLightSource/davidia",
)
