import httpx
from datetime import date


def fetch_steam_detail(app_id: int) -> dict | None:
    resp = httpx.get(
        "https://store.steampowered.com/api/appdetails",
        params={"appids": app_id, "cc": "kr", "l": "korean"},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json().get(str(app_id), {})
    if not data.get("success"):
        return None
    return data["data"]


def fetch_steamspy(app_id: int) -> dict:
    resp = httpx.get(
        "https://steamspy.com/api.php",
        params={"request": "appdetails", "appid": app_id},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def parse_release_date(raw: str | None) -> date | None:
    if not raw:
        return None
    for fmt in ("%d %b, %Y", "%b %Y", "%Y"):
        try:
            from datetime import datetime
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            continue
    return None
