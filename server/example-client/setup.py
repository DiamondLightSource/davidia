from setuptools import setup

__version__ = "1.0.0"

setup(
    name="davidia-example-client",
    version=__version__,
    description="Example frontend for Davidia",
    long_description="Static files to serve for an example Davidia plot client",
    author_email="dataanalysis@diamond.ac.uk",
    package_dir={
        "davidia.client": "sdist",
    },
    package_data={
        "davidia.client": ["*.png", "*.ico", "*.html", "*.txt", "*.json"],
        "davidia.client.assets": ["*.css", "*.js"],
    },
    entry_points={
        "console_scripts": [
            "dvd-demo = davidia.demos.simple:start_and_run_all_demos",
        ],
    },
    python_requires=">=3.10",
    install_requires=[
        "davidia",
    ],
    url="https://github.com/DiamondLightSource/davidia",
)
