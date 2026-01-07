import requests
import json

# Step 1: Login to get token
login_url = 'http://localhost:8000/api/auth/login/'
login_data = {
    'email': 'admin@servicedesk.com',  # ✅ Your actual admin email
    'password': 'admin123'  # ✅ Update if different
}

print("🔐 Logging in...")
try:
    login_response = requests.post(login_url, json=login_data)
    
    if login_response.status_code == 200:
        response_data = login_response.json()
        token = response_data['tokens']['access']  # ✅ Fixed: nested path
        print("✅ Login successful!\n")
    else:
        print("❌ Login failed:", login_response.status_code)
        print("Response:", login_response.text)
        exit()
except Exception as e:
    print(f"❌ Error: {e}")
    exit()

# Step 2: Test RAG search with authentication
url = 'http://localhost:8000/api/kb-search/'
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}

test_queries = [
    'how to reset my password',
    'vpn connection problems',
    'setup email on mobile',
    'forgot password help'
]

print("🧪 Testing RAG Search API")
print("=" * 60)

for query in test_queries:
    print(f"\n📝 Query: {query}")
    print("-" * 60)
    
    try:
        response = requests.post(
            url,
            json={'query': query},
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: Success")
            print(f"🎯 AI Answer: {data['ai_answer']}")
            print(f"📚 Found {data['found_count']} articles:")
            
            for i, article in enumerate(data['articles'], 1):
                print(f"\n   {i}. {article['title']}")
                print(f"      Relevance: {article.get('relevance_score', 'N/A')}%")
                print(f"      Snippet: {article['snippet'][:100]}...")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print("=" * 60)

print("\n✅ Testing complete!")
