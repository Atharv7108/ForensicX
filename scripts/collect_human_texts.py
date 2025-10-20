#!/usr/bin/env python3
"""
Collect human-written texts from open datasets (wikipedia, ag_news) by domain keywords.
Saves a CSV with columns: text, source, lang

Usage:
  python scripts/collect_human_texts.py \
    --out data/raw/human.csv \
    --domains tech education healthcare finance sports science law politics environment art \
    --per-domain 200
"""
import argparse
from pathlib import Path
import re
import random
import pandas as pd

try:
    from datasets import load_dataset
except Exception as e:
    raise SystemExit("Please install 'datasets' (pip install datasets) to use this script")


DEFAULT_DOMAIN_KEYWORDS = {
    "tech": ["technology", "software", "computer", "AI", "machine learning", "internet", "programming"],
    "education": ["education", "schools", "universities", "students", "learning", "teaching"],
    "healthcare": ["health", "medicine", "disease", "hospital", "treatment", "public health"],
    "finance": ["finance", "banking", "markets", "stocks", "economy", "investment", "crypto"],
    "sports": ["sports", "football", "cricket", "basketball", "tennis", "athlete", "tournament"],
    "science": ["science", "physics", "chemistry", "biology", "astronomy", "research"],
    "law": ["law", "legal", "court", "constitution", "regulation", "policy"],
    "politics": ["politics", "election", "parliament", "government", "diplomacy", "policy"],
    "environment": ["environment", "climate", "biodiversity", "conservation", "pollution"],
    "art": ["art", "music", "film", "painting", "literature", "culture"],
}


def normalize_text(s: str) -> str:
    s = s.replace("\r", " ").replace("\n", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def sample_wikipedia(domains, per_domain=200, seed=42):
    ds = load_dataset("wikipedia", "20220301.en", split="train")
    rng = random.Random(seed)
    records = []
    for domain in domains:
        keywords = DEFAULT_DOMAIN_KEYWORDS.get(domain, [domain])
        # naive filter by keyword occurrence in text or title
        candidates = []
        for ex in ds.shuffle(seed=seed).select(range(100000)):
            text = ex.get("text") or ""
            title = ex.get("title") or ""
            hay = f"{title}\n{text}".lower()
            if any(kw.lower() in hay for kw in keywords):
                norm = normalize_text(text)
                if len(norm) > 200:
                    candidates.append(norm)
            if len(candidates) >= per_domain * 3:
                break
        rng.shuffle(candidates)
        picked = candidates[:per_domain]
        for t in picked:
            records.append({"text": t, "source": f"wikipedia:{domain}", "lang": "en"})
        print(f"Collected {len(picked)} Wikipedia samples for domain '{domain}'")
    return records


def sample_ag_news(per_domain_total=1000, seed=42):
    ds = load_dataset("ag_news", split="train")
    rng = random.Random(seed)
    records = []
    # label mapping: 0=World,1=Sports,2=Business,3=Sci/Tech
    cat_source = {0: "world", 1: "sports", 2: "business", 3: "science_tech"}
    per_cat = per_domain_total // 4
    for cat in [0, 1, 2, 3]:
        rows = [r for r in ds if r["label"] == cat]
        rng.shuffle(rows)
        rows = rows[:per_cat]
        for r in rows:
            text = normalize_text((r.get("text") or "") + " " + (r.get("description") or ""))
            if len(text) > 100:
                records.append({"text": text, "source": f"ag_news:{cat_source[cat]}", "lang": "en"})
        print(f"Collected {len(rows)} AG News samples for category {cat_source[cat]}")
    return records


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="data/raw/human.csv")
    ap.add_argument("--domains", nargs="+", default=list(DEFAULT_DOMAIN_KEYWORDS.keys()))
    ap.add_argument("--per-domain", type=int, default=200)
    ap.add_argument("--ag-news", action="store_true", help="Also sample AG News for variety")
    ap.add_argument("--skip-wikipedia", action="store_true", help="Skip Wikipedia (avoids large download)")
    ap.add_argument("--ag-count", type=int, default=1000)
    args = ap.parse_args()

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    records = []
    if not args.skip_wikipedia and args.per_domain > 0:
        records += sample_wikipedia(args.domains, args.per_domain)
    if args.ag_news:
        records += sample_ag_news(args.ag_count)

    df = pd.DataFrame(records)
    df.to_csv(out_path, index=False)
    print(f"Saved {len(df)} human samples to {out_path}")


if __name__ == "__main__":
    main()
