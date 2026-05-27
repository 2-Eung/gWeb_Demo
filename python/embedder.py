import os
import httpx
from dotenv import load_dotenv

# Load root .env file relative to this file
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    load_dotenv()

OLLAMA_BASE_URL = os.environ["OLLAMA_BASE_URL"]
EMBED_MODEL = os.environ["OLLAMA_EMBED_MODEL"]


def embed(text: str) -> list[float]:
    resp = httpx.post(
        f"{OLLAMA_BASE_URL}/api/embed",
        json={"model": EMBED_MODEL, "input": text},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["embeddings"][0]
