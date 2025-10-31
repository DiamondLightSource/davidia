import pathlib
from setuptools import setup

__version__ = "1.0.4"


def find_readme():
    current_dir = pathlib.Path(__file__).absolute().parent
    readme = current_dir / "README.md"
    if not readme.is_file():
        import shutil

        parent_dir = current_dir.parent
        shutil.copy(parent_dir / "README.md", current_dir)
    if readme.is_file():
        return readme
    raise FileNotFoundError(f"README.md not found in {current_dir} or {parent_dir}")


readme_path = find_readme()


setup(
    name="davidia",
    version=__version__,
    description="Plot server with React frontend data visualiser",
    long_description=open(readme_path).read(),
    long_description_content_type="text/markdown",
    author_email="dataanalysis@diamond.ac.uk",
    package_dir={
        "davidia": "davidia",
        "davidia.demos": "demos",
    },
    package_data={
        "davidia.data": ["*.png"],
    },
    entry_points={
        "console_scripts": [
            "dvd-server = davidia.main:main",
            "dvd-benchmark = davidia.demos.benchmark:main",
        ],
    },
    python_requires=">=3.10",
    install_requires=[
        "before-after",
        "fastapi",
        "httpx",
        "msgpack",
        "pillow",
        "pydantic-numpy",
        "orjson",
        "requests",
        "uvicorn",
        "websockets",
    ],
    extras_require={
        "test": [
            "pytest",
            "pytest-asyncio",
        ],
        "all": ["davidia-example-client"],
    },
    url="https://github.com/DiamondLightSource/davidia",
)
