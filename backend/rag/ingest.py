"""
Legal Data Ingestion Script
Loads Indian legal documents, chunks them, and saves a TF-IDF pickle.
Pure Python — no PyTorch, no C++ compiler, no Rust needed.

Run this ONCE before starting the server:
    cd backend
    python rag/ingest.py
"""
import os
import sys
import pickle
from pathlib import Path

# path to backend/ directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legalai.settings')

import django
django.setup()

from django.conf import settings


def load_and_chunk_documents():
    """Load all .txt files and split into chunks."""
    legal_data_path = settings.LEGAL_DATA_PATH
    print(f"Loading documents from: {legal_data_path}")

    chunks = []
    txt_files = list(Path(legal_data_path).glob("**/*.txt"))

    if not txt_files:
        return []

    for file_path in txt_files:
        print(f"  Reading: {file_path.name}")
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()

        # Split into chunks of ~800 characters with 100 char overlap
        chunk_size = 800
        overlap = 100
        source_name = file_path.stem.replace('_', ' ').title()
        words = text.split()
        word_chunks = []
        i = 0
        while i < len(words):
            chunk_words = words[i:i + 120]  # ~800 chars
            chunk_text = ' '.join(chunk_words)
            if len(chunk_text.strip()) > 50:  # skip tiny chunks
                word_chunks.append({
                    'text': chunk_text,
                    'source': source_name,
                    'file': str(file_path)
                })
            i += 110  # slide window with overlap

        chunks.extend(word_chunks)
        print(f"    -> {len(word_chunks)} chunks")

    return chunks


def save_index(chunks):
    """Save chunks as a pickle file for TF-IDF retrieval."""
    save_path = settings.VECTOR_STORE_PATH
    os.makedirs(save_path, exist_ok=True)
    index_path = os.path.join(save_path, 'tfidf_index.pkl')

    with open(index_path, 'wb') as f:
        pickle.dump(chunks, f)

    # Also pre-fit the TF-IDF matrix and save
    print("Pre-fitting TF-IDF matrix (requires sklearn)...")
    from sklearn.feature_extraction.text import TfidfVectorizer
    tfidf = TfidfVectorizer(ngram_range=(1, 2), max_features=10000, stop_words='english')
    tfidf.fit([c['text'] for c in chunks])

    tfidf_path = os.path.join(save_path, 'tfidf_vectorizer.pkl')
    with open(tfidf_path, 'wb') as f:
        pickle.dump(tfidf, f)

    print(f"Index saved: {index_path}")
    print(f"TF-IDF vectorizer saved: {tfidf_path}")
    return index_path


if __name__ == "__main__":
    print("=" * 60)
    print("LegalAI Ingestion Pipeline (Pure Python TF-IDF)")
    print("=" * 60)

    chunks = load_and_chunk_documents()
    if not chunks:
        print("ERROR: No .txt files found in legal_data/ directory.")
        sys.exit(1)

    print(f"\nTotal chunks: {len(chunks)}")
    save_index(chunks)

    print("\n✓ Ingestion complete! Knowledge base is ready.")
    print("Now start the server: python manage.py runserver")
