# Python document worker

Optional sidecar for the MLAI app. The app reaches it only by a configured URL.
A closed port is unavailable. The app does not spawn this process.

Run it yourself when a document pipeline is needed. Python 3.11–3.13 and uv
match `pyproject.toml`. A local model is optional. This worker does not
provision an Abbey session or a shared product account.
