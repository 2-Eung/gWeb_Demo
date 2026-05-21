import os

import httpx


def fetch_youtube_signals(game_name: str, max_results: int = 20) -> list[dict]:
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        return []

    search_resp = httpx.get(
        "https://www.googleapis.com/youtube/v3/search",
        params={
            "key": api_key,
            "q": f"{game_name} gameplay",
            "type": "video",
            "part": "snippet",
            "maxResults": max_results,
            "order": "viewCount",
        },
        timeout=30,
    )
    search_resp.raise_for_status()
    items = search_resp.json().get("items", [])
    if not items:
        return []

    video_items = [item for item in items if item.get("id", {}).get("videoId")]
    if not video_items:
        return []

    video_ids = ",".join(item["id"]["videoId"] for item in video_items)
    stats_resp = httpx.get(
        "https://www.googleapis.com/youtube/v3/videos",
        params={
            "key": api_key,
            "id": video_ids,
            "part": "statistics,snippet",
        },
        timeout=30,
    )
    stats_resp.raise_for_status()
    stats_by_id = {v["id"]: v for v in stats_resp.json().get("items", [])}

    signals = []
    for item in video_items:
        vid_id = item["id"]["videoId"]
        vid_data = stats_by_id.get(vid_id, {})
        stats = vid_data.get("statistics", {})
        snippet = vid_data.get("snippet", item.get("snippet", {}))
        signals.append({
            "source_id": vid_id,
            "url": f"https://www.youtube.com/watch?v={vid_id}",
            "title": snippet.get("title", ""),
            "author": snippet.get("channelTitle", ""),
            "engagement_count": int(stats.get("viewCount", 0)),
            "published_at": snippet.get("publishedAt"),
        })
    return signals
