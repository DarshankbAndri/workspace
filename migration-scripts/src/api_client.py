"""Thin HTTP client for the CMMS backend.

Wraps ``requests`` with a shared session, a bearer token, correlation-id
generation and consistent (status_code, body, error) return values. The backend
wraps every JSON response in an ``ApiResponse`` envelope::

    { "timestamp", "status", "success", "code", "message", "data", ... }

so helpers here expose ``extract_data`` / ``extract_message`` to read it.
"""

import uuid

import requests


class ApiError(Exception):
    """Raised for transport-level problems (timeout, connection refused, ...)."""


class ApiClient:
    def __init__(self, base_url: str, timeout_seconds: int = 30, logger=None):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout_seconds
        self.logger = logger
        self.session = requests.Session()
        self._token = None

    # -- auth ---------------------------------------------------------------
    def set_token(self, token: str) -> None:
        """Attach the bearer token to every subsequent request."""
        self._token = token
        self.session.headers.update({"Authorization": f"Bearer {token}"})

    # -- low level ----------------------------------------------------------
    def _url(self, path: str) -> str:
        return f"{self.base_url}/{path.lstrip('/')}"

    def _request(self, method: str, path: str, json_body=None):
        """Return (status_code, parsed_body_or_None). Raises ApiError on transport failure."""
        url = self._url(path)
        headers = {"X-Correlation-Id": str(uuid.uuid4())}
        try:
            resp = self.session.request(
                method=method.upper(),
                url=url,
                json=json_body,
                headers=headers,
                timeout=self.timeout,
            )
        except requests.exceptions.Timeout as exc:
            raise ApiError(f"Request timed out after {self.timeout}s: {method} {url}") from exc
        except requests.exceptions.ConnectionError as exc:
            raise ApiError(f"Could not connect to backend: {method} {url}") from exc
        except requests.exceptions.RequestException as exc:
            raise ApiError(f"Request failed: {method} {url} - {exc}") from exc

        try:
            body = resp.json() if resp.content else None
        except ValueError:
            body = {"_raw": resp.text}
        return resp.status_code, body

    def post(self, path: str, json_body: dict):
        return self._request("POST", path, json_body)

    def get(self, path: str):
        return self._request("GET", path)

    # -- ApiResponse envelope helpers --------------------------------------
    @staticmethod
    def extract_data(body):
        """Return the ``data`` payload from an ApiResponse envelope (or the body itself)."""
        if isinstance(body, dict) and "data" in body:
            return body["data"]
        return body

    @staticmethod
    def extract_message(body):
        """Best-effort human readable message from an ApiResponse / error body."""
        if not isinstance(body, dict):
            return str(body) if body is not None else ""
        parts = []
        if body.get("message"):
            parts.append(str(body["message"]))
        # Standard validation errors: details[] with {field, message}
        details = body.get("details")
        if isinstance(details, list):
            for d in details:
                if isinstance(d, dict):
                    field = d.get("field", "")
                    msg = d.get("message", "")
                    parts.append(f"{field}: {msg}".strip(": "))
        if body.get("code"):
            parts.append(f"[code={body['code']}]")
        return " | ".join(parts) if parts else str(body)
