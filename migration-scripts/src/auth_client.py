"""Login flow for the migration utility.

Calls ``POST /api/auth/login`` with username/password and extracts the JWT from
whichever response shape the backend uses. The CMMS backend returns it at
``data.token`` (inside the ApiResponse envelope), but this also tolerates
``token``, ``accessToken`` and ``data.accessToken`` so the same utility works if
the auth contract changes.

The password is never written to logs.
"""

from api_client import ApiClient, ApiError


class AuthError(Exception):
    """Raised when login fails (bad credentials, unreachable server, no token)."""


# Ordered list of (container_key, token_key). container_key of None means top level.
_TOKEN_LOCATIONS = [
    (None, "token"),
    (None, "accessToken"),
    ("data", "token"),
    ("data", "accessToken"),
]


def _find_token(body) -> str:
    if not isinstance(body, dict):
        return None
    for container, key in _TOKEN_LOCATIONS:
        source = body.get(container) if container else body
        if isinstance(source, dict) and source.get(key):
            return source[key]
    return None


def login(api: ApiClient, login_url: str, username: str, password: str, logger) -> str:
    """Authenticate and return a JWT string. Raises AuthError on any failure."""
    logger.info("Logging in as '%s' ...", username)
    payload = {"username": username, "password": password}  # password not logged
    try:
        status, body = api.post(login_url, payload)
    except ApiError as exc:
        raise AuthError(f"Login request failed: {exc}") from exc

    if status == 200 or status == 201:
        token = _find_token(body)
        if not token:
            raise AuthError(
                "Login succeeded but no token found in response "
                "(checked token / accessToken / data.token / data.accessToken)."
            )
        logger.info("Login successful, token acquired.")
        return token

    message = ApiClient.extract_message(body)
    if status in (401, 403):
        raise AuthError(f"Login failed ({status}): invalid credentials or access denied. {message}")
    raise AuthError(f"Login failed with HTTP {status}. {message}")
