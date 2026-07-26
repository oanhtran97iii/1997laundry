import os
import json
from bs4 import BeautifulSoup, NavigableString

DIR = "/Users/oanhtran97/.gemini/antigravity/scratch/website-1997/vi/"
FILES = [
    "index.html",
    "express-laundry.html",
    "dry-cleaning.html",
    "steam-press.html",
    "shoes-cleaning.html",
    "curtain-cleaning.html"
]

all_texts = {}

def extract_texts():
    for filename in FILES:
        filepath = os.path.join(DIR, filename)
        if not os.path.exists(filepath):
            continue
        with open(filepath, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
        
        texts = set()
        for element in soup.descendants:
            if isinstance(element, NavigableString):
                parent = element.parent
                if parent.name not in ['script', 'style', 'meta', 'link']:
                    text = element.string
                    if text and text.strip():
                        # check if it contains any letter
                        if any(c.isalpha() for c in text):
                            texts.add(text)
        all_texts[filename] = list(texts)

    with open(os.path.join(DIR, "texts_to_translate.json"), "w", encoding='utf-8') as f:
        json.dump(all_texts, f, ensure_ascii=False, indent=2)

    total_strings = sum(len(v) for v in all_texts.values())
    print(f"Extracted {total_strings} strings across {len(all_texts)} files.")

if __name__ == "__main__":
    extract_texts()
