import json
from pathlib import Path

from davidia.main import _create_bare_app

app = _create_bare_app()

public_path = Path("storybook/public/openapi.json")
public_path.parent.mkdir(exist_ok=True)

with open(public_path, "w") as f:
    json.dump(app.openapi(), f)

print(f"OpenAPI schema saved to {public_path}")
