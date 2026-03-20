"""
RAG Chain for LegalAI Chatbot
Pure Python implementation - no PyTorch, no C++, no Rust required.
Uses TF-IDF retrieval (sklearn) + Groq LLM for generation.
"""
import os
import sys
from pathlib import Path
import pickle
import re

# path to backend/ directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legalai.settings')

from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from django.conf import settings


# ── Prompt ─────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are VakilBot, an expert AI legal assistant specializing in Indian law.
You provide clear, accurate, and helpful legal information based on Indian constitutional law,
statutes, and judicial precedents.

IMPORTANT GUIDELINES:
- Always refer to Indian laws, acts, and the Constitution of India
- Cite specific Articles, Sections, or Acts when relevant  
- Explain legal concepts in simple, accessible language
- If the question is outside your legal knowledge, say so clearly
- Always remind users to consult a qualified lawyer for formal legal advice
- Be empathetic and professional
- Format your response with clear paragraphs"""


# ── TF-IDF Retriever ────────────────────────────────────────────────────────────
_retriever = None


class TFIDFRetriever:
    """Pure-Python TF-IDF retrieval — no native extensions needed."""

    def __init__(self, chunks):
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np

        self.chunks = chunks
        self.tfidf = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=10000,
            stop_words='english'
        )
        self.matrix = self.tfidf.fit_transform([c['text'] for c in chunks])
        self._cosine = cosine_similarity
        self._np = np

    def retrieve(self, query, k=5):
        query_vec = self.tfidf.transform([query])
        scores = self._cosine(query_vec, self.matrix).flatten()
        top_k = self._np.argsort(scores)[::-1][:k]
        return [self.chunks[i] for i in top_k if scores[i] > 0]


def get_retriever():
    global _retriever
    if _retriever is None:
        index_path = os.path.join(str(settings.VECTOR_STORE_PATH), 'tfidf_index.pkl')
        if not os.path.exists(index_path):
            raise FileNotFoundError(
                "Knowledge base not found. Please run: "
                "cd backend && python rag/ingest.py"
            )
        with open(index_path, 'rb') as f:
            chunks = pickle.load(f)
        _retriever = TFIDFRetriever(chunks)
    return _retriever


def get_llm():
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY not set in .env")
    return ChatGroq(
        groq_api_key=api_key,
        model_name="llama-3.1-8b-instant",
        temperature=0.3,
        max_tokens=1024,
    )


def ask_legal_question(question: str, chat_history: list = None) -> dict:
    """
    Ask a legal question using TF-IDF retrieval + Groq LLM.
    chat_history: list of (human_msg, ai_msg) tuples
    Returns: {'answer': str, 'sources': list[dict]}
    """
    if chat_history is None:
        chat_history = []

    # Retrieve relevant chunks
    retriever = get_retriever()
    relevant_chunks = retriever.retrieve(question, k=5)

    if relevant_chunks:
        context = "\n\n---\n\n".join([
            f"[Source: {c['source']}]\n{c['text']}" for c in relevant_chunks
        ])
    else:
        context = "No specific legal text found. Answering from general Indian law knowledge."

    # Build chat history string
    history_str = ""
    for human, ai in chat_history[-3:]:  # last 3 exchanges
        history_str += f"Human: {human}\nAssistant: {ai}\n\n"

    # Build the full prompt
    full_prompt = f"""{SYSTEM_PROMPT}

Relevant Legal Context:
{context}

Previous Conversation:
{history_str}
Question: {question}

Please provide a clear, helpful legal answer:"""

    llm = get_llm()
    response = llm.invoke([HumanMessage(content=full_prompt)])
    answer = response.content

    sources = [
        {"snippet": c['text'][:200], "source": c['source']}
        for c in relevant_chunks
    ]

    return {
        "answer": answer,
        "sources": sources
    }


if __name__ == "__main__":
    django.setup()
    print("Testing RAG chain...")
    try:
        result = ask_legal_question("What is Article 21 of the Indian Constitution?")
        print("\nAnswer:", result["answer"][:500])
        print("\nSources found:", len(result["sources"]))
    except FileNotFoundError as e:
        print(f"Error: {e}")
    except ValueError as e:
        print(f"Config Error: {e}")
        print("Add GROQ_API_KEY to backend/.env")
