import google.generativeai as genai
from django.conf import settings
from .models import KBArticle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# Global storage for vectorizer and embeddings
vectorizer = None
article_vectors = None
article_ids = []


def rebuild_rag_index():
    """Rebuild the search index from all KB articles"""
    global vectorizer, article_vectors, article_ids
    
    articles = KBArticle.objects.all()
    
    if not articles.exists():
        return {'count': 0, 'message': 'No articles to index'}
    
    # Create corpus
    corpus = []
    article_ids = []
    
    for article in articles:
        text = f"{article.title} {article.content}"
        corpus.append(text)
        article_ids.append(article.id)
    
    # Build TF-IDF vectors
    vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    article_vectors = vectorizer.fit_transform(corpus)
    
    return {
        'count': len(article_ids),
        'message': f'Successfully indexed {len(article_ids)} articles'
    }


def search_articles_with_rag(query, top_k=3):
    """Search articles using RAG and generate AI answer"""
    global vectorizer, article_vectors, article_ids
    
    # Rebuild index if not initialized
    if vectorizer is None or article_vectors is None:
        rebuild_rag_index()
    
    if not article_ids:
        return {
            'ai_answer': 'No knowledge base articles found. Please add some articles first.',
            'articles': [],
            'found_count': 0
        }
    
    # Vectorize query
    query_vector = vectorizer.transform([query])
    
    # Calculate similarities
    similarities = cosine_similarity(query_vector, article_vectors).flatten()
    
    # Get top matches
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    # Retrieve articles
    results = []
    context_parts = []
    
    for idx in top_indices:
        if similarities[idx] > 0.1:  # Relevance threshold
            article = KBArticle.objects.get(id=article_ids[idx])
            
            results.append({
                'id': article.id,
                'title': article.title,
                'snippet': article.content[:200],
                'category': article.category,
                'relevance_score': int(similarities[idx] * 100)
            })
            
            context_parts.append(f"Title: {article.title}\nContent: {article.content[:500]}")
    
    # Generate AI answer using Gemini
    if context_parts:
        context = "\n\n".join(context_parts)
        prompt = f"""Based on the following knowledge base articles, answer the user's question concisely and helpfully.

Knowledge Base:
{context}

User Question: {query}

Provide a clear, direct answer based on the information above. If the information doesn't fully answer the question, say so."""
        
        try:
            # ✅ FIXED: Use the correct model name
            model = genai.GenerativeModel('gemini-flash-latest')
            response = model.generate_content(prompt)
            ai_answer = response.text
        except Exception as e:
            print(f"Gemini API error: {e}")
            ai_answer = f"I found {len(results)} relevant article(s) but couldn't generate an AI summary. Please check the articles below or verify your Gemini API key."
    else:
        ai_answer = "I couldn't find relevant articles matching your query. Please try different keywords or browse all articles."
    
    return {
        'ai_answer': ai_answer,
        'articles': results,
        'found_count': len(results)
    }
