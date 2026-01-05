import google.genai as genai
from django.conf import settings
import json

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def categorize_ticket(subject, description):
    """Use Gemini AI to suggest the best category and priority for a ticket."""
    
    prompt = f"""
You are an intelligent ticket categorization system for a corporate support desk.

Analyze the following support ticket and determine the best category AND priority:

**Categories:**
1. HR (Human Resources) - Leave requests, payroll issues, benefits, hiring, employee relations
2. IT (Information Technology) - Computer problems, software issues, network/WiFi, account access, email
3. Facilities - Office maintenance, cleaning, parking, equipment, room booking, building issues
4. General - Everything else that doesn't fit the above

**Priority Levels:**
1. High - Critical issues affecting work, security threats, system outages, urgent requests
2. Medium - Important but not critical, can wait a few hours
3. Low - Minor issues, general questions, non-urgent requests

**Ticket Subject:** {subject}

**Ticket Description:** {description}

Respond in this exact JSON format:
{{
    "category": <number 1-4>,
    "priority": <number 1-3>,
    "confidence": "<high/medium/low>",
    "reasoning": "<brief explanation in one sentence>"
}}

Only return valid JSON, no other text.
"""

    try:
        response = client.models.generate_content(
            model='models/gemini-2.5-flash',
            contents=prompt
        )
        
        result_text = response.text.strip()
        
        if result_text.startswith('```'):
            result_text = result_text.split('```')[1]
            if result_text.startswith('json'):
                result_text = result_text[4:]
            result_text = result_text.strip()
        
        result = json.loads(result_text)
        
        # Validate
        if result.get('category') not in [1, 2, 3, 4]:
            result['category'] = 4
        if result.get('priority') not in [1, 2, 3]:
            result['priority'] = 3
        
        return result
        
    except Exception as e:
        print(f"AI categorization error: {e}")
        return {
            'category': 4,
            'priority': 3,
            'confidence': 'low',
            'reasoning': 'Unable to analyze, please select manually'
        }
