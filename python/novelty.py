from datetime import date, datetime, timezone


def calculate_decay(reviews: list[dict], release_date) -> dict:
    empty = {"decay_score": None, "week1_ratio": None, "month1_ratio": None, "total_analyzed": 0}
    if not reviews or not release_date:
        return empty

    if isinstance(release_date, datetime):
        release_ts = int(release_date.replace(tzinfo=timezone.utc).timestamp())
    elif isinstance(release_date, date):
        release_ts = int(datetime(release_date.year, release_date.month, release_date.day, tzinfo=timezone.utc).timestamp())
    else:
        return empty

    timestamps = [r["timestamp_created"] for r in reviews if "timestamp_created" in r]
    total = len(timestamps)
    if not total:
        return empty

    week1 = sum(1 for t in timestamps if 0 <= t - release_ts <= 7 * 86400)
    month1 = sum(1 for t in timestamps if 0 <= t - release_ts <= 30 * 86400)

    week1_ratio = week1 / total
    month1_ratio = month1 / total

    return {
        "decay_score": round(week1_ratio, 3),
        "week1_ratio": round(week1_ratio, 3),
        "month1_ratio": round(month1_ratio, 3),
        "total_analyzed": total,
    }
