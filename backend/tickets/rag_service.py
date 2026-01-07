import os
from sentence_transformers import SentenceTransformer
import chromadb
from django.conf import settings


try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


class RAGService:
    def __init__(self):
        # Initialize embedding model (lightweight, fast)
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(
            path=settings.VECTOR_DB_PATH,
            settings=chromadb.Settings(anonymized_telemetry=False)
        )
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="knowledge_base",
            metadata={"description": "KB articles for RAG"}
        )
        
        # Initialize Gemini if available
        self.llm = None
        if GENAI_AVAILABLE and settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.llm = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")
    
    def add_article(self, article_id, title, content, tags=None):
        """Add or update a KB article in the vector database."""
        # Combine title and content for better context
        full_text = f"{title}\n\n{content}"
        
        # Generate embedding
        embedding = self.embedding_model.encode(full_text).tolist()
        
        # Store in ChromaDB
        self.collection.upsert(
            ids=[str(article_id)],
            embeddings=[embedding],
            documents=[full_text],
            metadatas=[{
                'title': title,
                'tags': tags or '',
                'article_id': article_id
            }]
        )
        print(f"✅ Added article {article_id} to RAG index")
    
    def remove_article(self, article_id):
        """Remove a KB article from the vector database."""
        try:
            self.collection.delete(ids=[str(article_id)])
            print(f"🗑️ Removed article {article_id} from RAG index")
        except Exception as e:
            print(f"Error removing article {article_id}: {e}")
    
    def search_similar_articles(self, query: str, top_k: int = 5):
        """
        Search for similar articles using RAG.
        Returns list of {article_id, snippet, distance, relevance_score}
        """
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k,
                include=['documents', 'distances', 'metadatas']
            )
            
            articles = []
            if results['ids'] and results['ids'][0]:
                for i, article_id in enumerate(results['ids'][0]):
                    distance = results['distances'][0][i]
                    
                    # Better relevance calculation
                    # ChromaDB cosine distance: range is [0, 2]
                    # Convert to similarity percentage: (2 - distance) / 2 * 100
                    relevance_score = max(0, ((2 - distance) / 2) * 100)
                    
                    articles.append({
                        'article_id': int(article_id),
                        'snippet': results['documents'][0][i][:200],
                        'distance': distance,
                        'relevance_score': round(relevance_score, 1)
                    })
            
            return articles
        
        except Exception as e:
            print(f"RAG search error: {e}")
            return []
    
    def generate_answer(self, query: str, articles: list) -> str:
        """
        Generate AI answer using retrieved articles.
        
        Args:
            query: User's search query
            articles: List of dicts with keys: id, title, content, category, snippet, relevance_score
        
        Returns:
            AI-generated answer string
        """
        if not articles:
            return "No relevant articles found in the knowledge base. Please create a support ticket for personalized assistance."
        
        # Build context from top 3 articles
        context_parts = []
        for i, article in enumerate(articles[:3], 1):
            context_parts.append(
                f"Article {i}: {article.get('title', 'Untitled')}\n"
                f"{article.get('content', article.get('snippet', ''))[:500]}"
            )
        
        context = "\n\n".join(context_parts)
        
        prompt = f"""You are a helpful IT support assistant. Based on the knowledge base articles below, provide a clear and concise answer to the user's question.

User Question: {query}

Knowledge Base Articles:
{context}

Instructions:
- Provide a direct answer to the question
- Reference specific steps or information from the articles
- If the articles don't fully answer the question, suggest contacting IT support
- Keep the answer under 200 words
- Use a friendly, professional tone
- Do NOT use emojis

Answer:"""
        
        try:
            if not self.llm:
                return "AI answer generation is not available. Please refer to the articles below."
            
            response = self.llm.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"AI generation error: {e}")
            return "Unable to generate AI answer at this time. Please refer to the relevant articles below for assistance."
    
    def rebuild_index(self, articles: list) -> int:
        """
        Rebuild the entire RAG index from scratch.
        
        Args:
            articles: List of article dicts with keys: id, title, content
        
        Returns:
            Number of articles indexed
        """
        # Clear existing collection
        self.client.delete_collection("knowledge_base")
        self.collection = self.client.create_collection(
            name="knowledge_base",
            metadata={"description": "KB articles for RAG"}
        )
        
        # Add all articles
        count = 0
        for article in articles:
            self.add_article(
                article_id=article['id'],
                title=article['title'],
                content=article['content'],
                tags=article.get('tags', '')
            )
            count += 1
        
        return count


# Singleton instance
_rag_service = None

def get_rag_service():
    """Get or create the RAG service singleton."""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
