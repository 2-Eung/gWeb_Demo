import httpx


def fetch_steam_reviews(app_id: int, count: int = 100) -> list[dict]:
    reviews = []
    cursor = "*"
    while len(reviews) < count:
        batch_size = min(100, count - len(reviews))
        resp = httpx.get(
            f"https://store.steampowered.com/appreviews/{app_id}",
            params={
                "json": 1,
                "filter": "recent",
                "language": "all",
                "num_per_page": batch_size,
                "cursor": cursor,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("success") != 1:
            break
        batch = data.get("reviews", [])
        if not batch:
            break
        reviews.extend(batch)
        cursor = data.get("cursor", "*")
        if len(batch) < batch_size:
            break
    return reviews
