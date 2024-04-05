import json
from main import _create_bare_app


app, _ = _create_bare_app()

with open('openapi.json', 'w') as f:
    json.dump(app.openapi(), f)

print("OpenAPI schema saved to openapi.json")
