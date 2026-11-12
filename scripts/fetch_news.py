import json
import re
import time
import hashlib
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

FEEDS = [
    {
        "name": "OpenAI",
        "url": "https://openai.com/news/rss.xml",
        "category": "AI"
    },
    {
        "name": "Google AI",
        "url": "https://blog.google/technology/ai/rss/",
        "category": "AI"
    },
    {
        "name": "The Robot Report",
        "url": "https://www.therobotreport.com/feed/",
        "category": "ROBOTICS"
    },
    {
        "name": "NVIDIA Robotics",
        "url": "https://blogs.nvidia.com/blog/category/robotics/feed/",
        "category": "HUMANOIDS"
    }
]

OUTPUT = Path("data/news.json")
MAX_ITEMS = 100


def clean(value):
    if not value:
        return ""
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def get_text(element, names):
    for child in element.iter():
        tag = child.tag.split("}")[-1].lower()
        if tag in names and child.text:
            return clean(child.text)
    return ""


def get_link(item):
    for child in item:
        tag = child.tag.split("}")[-1].lower()
        if tag == "link":
            href = child.attrib.get("href")
            if href:
                return href
            if child.text:
                return child.text.strip()
    return ""


def fetch_feed(feed):
    request = urllib.request.Request(
        feed["url"],
        headers={"User-Agent": "NEXORA-AI-NewsBot/1.0"}
    )

    with urllib.request.urlopen(request, timeout=20) as response:
        root = ET.fromstring(response.read())

    results = []

    for item in root.iter():
        tag = item.tag.split("}")[-1].lower()
        if tag not in ("item", "entry"):
            continue

        title = get_text(item, {"title"})
        link = get_link(item)
        description = get_text(
            item, {"description", "summary", "content"}
        )
        published = get_text(
            item, {"pubdate", "published", "updated", "date"}
        )

        if not title or not link:
            continue

        uid = hashlib.sha256(link.encode()).hexdigest()[:16]

        results.append({
            "id": uid,
            "title": title,
            "summary": description[:450],
            "url": link,
            "source": feed["name"],
            "category": feed["category"],
            "published": published
        })

    return results


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    articles = []
    errors = []

    for feed in FEEDS:
        try:
            found = fetch_feed(feed)
            articles.extend(found[:25])
            print(f"[OK] {feed['name']}: {len(found)} hir")
        except Exception as error:
            errors.append(feed["name"])
            print(f"[HIBA] {feed['name']}: {error}")
        time.sleep(1)

    unique = {}
    for article in articles:
        unique[article["id"]] = article

    final_news = list(unique.values())[:MAX_ITEMS]

    data = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "total": len(final_news),
        "news": final_news
    }

    OUTPUT.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print("--------------------------------")
    print(f"Összes hír: {len(final_news)}")
    print(f"Sikertelen források: {len(errors)}")
    print(f"Mentve: {OUTPUT}")


if __name__ == "__main__":
    main()
