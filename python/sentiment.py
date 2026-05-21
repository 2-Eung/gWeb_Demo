import re
from collections import Counter

_POSITIVE = {
    "재미있", "재밌", "좋아", "좋다", "추천", "신기", "몰입", "훌륭", "최고", "완벽",
    "fun", "good", "great", "amazing", "awesome", "interesting", "enjoy", "love",
    "recommend", "perfect", "excellent", "addictive", "immersive", "innovative", "unique",
}
_NEGATIVE = {
    "별로", "실망", "오류", "버그", "인식", "안됨", "피로", "지루", "최악", "구림", "망겜",
    "bad", "boring", "broken", "lag", "frustrating", "terrible", "awful", "garbage",
    "waste", "laggy", "glitch", "crash", "unplayable", "disappointed",
}
_STOP = {
    "the", "a", "an", "is", "it", "this", "game", "and", "or", "for", "to", "in",
    "of", "with", "that", "you", "i", "my", "me", "on", "at", "by", "be", "was", "are",
    "이", "가", "은", "는", "를", "의", "에", "도", "게임", "그", "이것", "하다",
}


def score_review(text: str) -> float:
    words = re.findall(r'\b\w{2,}\b', text.lower())
    pos = sum(1 for w in words if any(w.startswith(k) for k in _POSITIVE))
    neg = sum(1 for w in words if any(w.startswith(k) for k in _NEGATIVE))
    total = pos + neg
    if total == 0:
        return 0.0
    return round((pos - neg) / total, 3)


def extract_keywords(reviews: list[dict], top_n: int = 10) -> tuple[list[str], list[str]]:
    pos_counter: Counter = Counter()
    neg_counter: Counter = Counter()
    for r in reviews:
        text = r.get("review", "")
        voted_up = r.get("voted_up", True)
        words = [w for w in re.findall(r'\b[a-zA-Z가-힣]{2,}\b', text.lower()) if w not in _STOP]
        if voted_up:
            pos_counter.update(words)
        else:
            neg_counter.update(words)

    pos_only = {w: c for w, c in pos_counter.items()
                if w not in neg_counter or pos_counter[w] > neg_counter[w] * 2}
    neg_only = {w: c for w, c in neg_counter.items()
                if w not in pos_counter or neg_counter[w] > pos_counter[w] * 2}

    positive_kws = [w for w, _ in sorted(pos_only.items(), key=lambda x: -x[1])[:top_n]]
    negative_kws = [w for w, _ in sorted(neg_only.items(), key=lambda x: -x[1])[:top_n]]
    return positive_kws, negative_kws
