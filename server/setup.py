import os
from setuptools import setup

# from davidia import __version__
__version__ = "1.0.0"


def get_readme(current_dir):
    path = os.path.join(current_dir, "README.md")
    return path if os.path.exists(path) else None


def find_readme():
    current_dir = os.path.abspath(os.path.dirname(__file__))
    readme = get_readme(current_dir)
    if readme is not None:
        return readme

    parent_dir = os.path.dirname(current_dir)
    readme = get_readme(parent_dir)
    if readme is not None:
        import shutil

        return shutil.copy(readme, current_dir)

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
        "davidia.client": ["*.png", "*.ico", "*.html", "*.txt"],
        "davidia.client.assets": ["*.css", "*.js"],
    },
    entry_points={
        "console_scripts": [
            "dvd-server = davidia.main:main",
            "dvd-demo = davidia.demos.simple:start_and_run_all_demos",
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
    },
    url="https://github.com/DiamondLightSource/davidia",
)
