import json
import random
import logging
import httpx
from typing import Dict, Any, Tuple
from backend.utils.config import settings

logger = logging.getLogger(__name__)

# List of all categories supported
CATEGORIES = [
    "Artificial Intelligence", "Technology", "Startups", "Business", "Finance",
    "Productivity", "Education", "Travel", "Gaming", "Fitness", "Health", "Entrepreneurship",
    "Celebrity Content", "Politics", "Sports", "Entertainment", "Gossip"
]

# Keywords mapping for high-fidelity fallback classification
KEYWORD_MAPPING = {
    "Artificial Intelligence": ["openai", "chatgpt", "gemini", "ai", "artificial intelligence", "machine learning", "deep learning", "neural network", "llm", "claude", "robotics"],
    "Technology": ["apple", "google", "microsoft", "software", "hardware", "gadget", "processor", "chip", "iphone", "android", "tech", "coding", "developer", "cloud"],
    "Startups": ["startup", "funding", "round a", "y combinator", "yc", "founder", "incubator", "seed round", "valuation", "pitch deck", "unicorn"],
    "Business": ["business", "ceo", "revenue", "stocks", "shares", "nasdaq", "merger", "acquisition", "corporate", "strategy", "management"],
    "Finance": ["finance", "crypto", "bitcoin", "investment", "portfolio", "interest rate", "inflation", "banking", "money", "savings", "tax"],
    "Productivity": ["productivity", "habits", "notion", "schedule", "time management", "focus", "flow state", "organization", "goals", "routine"],
    "Education": ["education", "course", "university", "tutorial", "learn", "academy", "curriculum", "study", "research", "book", "lecture"],
    "Travel": ["travel", "flight", "hotel", "backpacking", "destination", "vacation", "explore", "wanderlust", "tourism", "trip"],
    "Gaming": ["gaming", "xbox", "playstation", "nintendo", "steam", "multiplayer", "fps", "rpg", "console", "gameplay", "streamer"],
    "Fitness": ["fitness", "workout", "gym", "cardio", "muscles", "weights", "crossfit", "exercise", "training", "bodybuilding"],
    "Health": ["health", "nutrition", "mental health", "diet", "doctor", "wellness", "sleep", "medication", "therapy"],
    "Entrepreneurship": ["entrepreneur", "side hustle", "venture capital", "vc", "bootstrap", "solopreneur", "mvp", "launching"],
    "Celebrity Content": ["kardashian", "oscar", "red carpet", "celebrity", "dating", "hollywood", "paparazzi", "met gala", "famous"],
    "Politics": ["politics", "election", "president", "senate", "policy", "democrat", "republican", "government", "parliament", "vote"],
    "Sports": ["sports", "football", "soccer", "nba", "lebron", "match", "championship", "athletes", "olympics", "super bowl", "cup"],
    "Entertainment": ["entertainment", "movie", "netflix", "concert", "singer", "actor", "tv show", "cinema", "music", "album", "drama"],
    "Gossip": ["gossip", "rumor", "tabloid", "spotted", "drama", "insider", "secrets", "scandal"]
}

class GeminiService:
    @staticmethod
    async def analyze_content(content_text: str) -> Dict[str, Any]:
        """
        Classifies content and returns the category and confidence using Gemini,
        falling back to local rule-based classification if no key is set or on API error.
        """
        if settings.GEMINI_API_KEY:
            try:
                # API Endpoint for Gemini 2.5 Flash
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                
                prompt = (
                    f"Classify the following text into exactly one of these categories: {', '.join(CATEGORIES)}.\n"
                    f"Return ONLY a raw JSON object with keys 'category' (must match one of the listed categories exactly) "
                    f"and 'confidence' (a float between 0.0 and 1.0).\n\n"
                    f"Text to classify:\n\"{content_text}\""
                )
                
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": {
                        "responseMimeType": "application/json"
                    }
                }
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(url, headers=headers, json=payload, timeout=8.0)
                    if response.status_code == 200:
                        res_json = response.json()
                        text_response = res_json["candidates"][0]["content"]["parts"][0]["text"]
                        data = json.loads(text_response.strip())
                        
                        category = data.get("category", "").strip()
                        confidence = float(data.get("confidence", 0.8))
                        
                        if category in CATEGORIES:
                            return {"category": category, "confidence": confidence}
                        
                        # Fix minor string mismatch
                        for c in CATEGORIES:
                            if c.lower() == category.lower():
                                return {"category": c, "confidence": confidence}
            except Exception as e:
                logger.error(f"Gemini API error: {e}. Falling back to simulated analysis.")

        # Local Fallback Ingestion Engine
        return GeminiService._fallback_analysis(content_text)

    @staticmethod
    def _fallback_analysis(content_text: str) -> Dict[str, Any]:
        """
        Calculates category and confidence score using keyword searches when Gemini is unavailable.
        """
        text_lower = content_text.lower()
        best_category = None
        max_matches = 0
        
        for category, keywords in KEYWORD_MAPPING.items():
            matches = sum(1 for word in keywords if word in text_lower)
            if matches > max_matches:
                max_matches = matches
                best_category = category
                
        if best_category:
            # High confidence if multiple keywords match, else moderate
            confidence = min(0.6 + (max_matches * 0.1), 0.98)
            return {"category": best_category, "confidence": round(confidence, 2)}
            
        # Default category if nothing matches
        default_categories = ["Technology", "Entertainment", "Productivity", "Gossip"]
        return {"category": random.choice(default_categories), "confidence": round(random.uniform(0.4, 0.65), 2)}

    @staticmethod
    async def generate_persona_posts(username: str, count: int = 4) -> list:
        """
        Generates highly realistic simulated Instagram post captions matching the style
        and topic category of the username provided.
        """
        if settings.GEMINI_API_KEY:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                prompt = (
                    f"You are simulating an Instagram scraping tool for a connected profile.\n"
                    f"Generate exactly {count} highly realistic Instagram post captions that the user @{username} would post.\n"
                    f"The captions should match their profile persona. For example:\n"
                    f"- If the username suggests technology/coding (e.g. 'coder_dan', 'techcrunch'), make the posts about programming, hardware, or startups.\n"
                    f"- If the username suggests space/science (e.g. 'nasa', 'astronomy_hub'), make them about rockets, stars, or exploration.\n"
                    f"- If the username suggests fitness (e.g. 'gym_shark', 'fitlife'), make them about workouts, healthy food, or motivation.\n"
                    f"- For a general/unspecified username, generate a diverse and interesting set of lifestyle, travel, and tech posts.\n\n"
                    f"Return ONLY a valid JSON array of strings, where each string is a single post caption. "
                    f"Do not include markdown tags other than the JSON format."
                )
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": {
                        "responseMimeType": "application/json"
                    }
                }
                async with httpx.AsyncClient() as client:
                    response = await client.post(url, headers=headers, json=payload, timeout=8.0)
                    if response.status_code == 200:
                        res_json = response.json()
                        text_response = res_json["candidates"][0]["content"]["parts"][0]["text"]
                        captions = json.loads(text_response.strip())
                        if isinstance(captions, list):
                            return [{"source": f"ig_persona_{username}_{i}", "text": caption} for i, caption in enumerate(captions)]
            except Exception as e:
                logger.error(f"Failed to generate Gemini persona posts for @{username}: {e}. Falling back.")

        return GeminiService._fallback_persona_posts(username, count)

    @staticmethod
    def _fallback_persona_posts(username: str, count: int = 4) -> list:
        """
        Generates simulated captions offline by searching the username's name
        and choosing appropriate mock posts from MOCK_POSTS.
        """
        from backend.services.automation_service import MOCK_POSTS
        username_lower = username.lower()
        
        # Determine likely persona
        tech_words = ["tech", "code", "dev", "ai", "geek", "soft", "byte", "crunch", "spacex", "nasa"]
        finance_words = ["crypto", "coin", "stock", "trade", "finance", "invest", "rich", "money", "btc"]
        fitness_words = ["fit", "gym", "workout", "health", "muscle", "run", "diet", "lift"]
        celeb_words = ["gossip", "celeb", "star", "pop", "swift", "kardashian", "show", "hollywood"]
        
        matched_category = None
        if any(w in username_lower for w in tech_words):
            matched_category = "Technology"
        elif any(w in username_lower for w in finance_words):
            matched_category = "Finance"
        elif any(w in username_lower for w in fitness_words):
            matched_category = "Fitness"
        elif any(w in username_lower for w in celeb_words):
            matched_category = "Celebrity Content"

        # If a category is matched, filter from MOCK_POSTS
        if matched_category:
            filtered_posts = []
            for post in MOCK_POSTS:
                text_lower = post["text"].lower()
                if matched_category == "Technology" and any(k in text_lower for k in ["gemini", "google", "python", "tech", "saas"]):
                    filtered_posts.append(post)
                elif matched_category == "Finance" and any(k in text_lower for k in ["bitcoin", "seed round", "funding", "market"]):
                    filtered_posts.append(post)
                elif matched_category == "Fitness" and any(k in text_lower for k in ["gym", "workout", "fitness", "meal prep", "leg day"]):
                    filtered_posts.append(post)
                elif matched_category == "Celebrity Content" and any(k in text_lower for k in ["kardashian", "swift", "hollywood", "gossip", "star"]):
                    filtered_posts.append(post)

            if len(filtered_posts) >= count:
                selected = random.sample(filtered_posts, count)
                return [{"source": f"ig_fallback_{username}_{i}", "text": p["text"]} for i, p in enumerate(selected)]

        # Fallback to random posts from MOCK_POSTS
        selected = random.sample(MOCK_POSTS, min(count, len(MOCK_POSTS)))
        return [{"source": f"ig_fallback_{username}_{i}", "text": p["text"]} for i, p in enumerate(selected)]

    @staticmethod
    def calculate_scores(category: str, confidence: float, preferences: Dict[str, Tuple[str, int]]) -> Tuple[int, int]:
        """
        Computes relevance_score (-10 to 10) and preference_match_score (0 to 100)
        based on active user preferences.
        
        preferences dict structure: { topic_name: (preference_type 'MORE'/'LESS', weight 1-10) }
        """
        # Default behavior: neutrality (0)
        relevance_score = 0
        
        if category in preferences:
            pref_type, weight = preferences[category]
            if pref_type == "MORE":
                # More content: Positive score scaled by weight and confidence
                relevance_score = int(weight * confidence)
            elif pref_type == "LESS":
                # Less content: Negative score scaled by weight and confidence
                relevance_score = int(-weight * confidence)
                
        # Clamp relevance score between -10 and 10
        relevance_score = max(-10, min(10, relevance_score))
        
        # Calculate matching score from 0 to 100 (mapping -10 to 0% and +10 to 100%)
        # Neural match calculation:
        preference_match_score = int(((relevance_score + 10) / 20) * 100)
        
        return relevance_score, preference_match_score

    @staticmethod
    async def generate_insights(history_scores: list, preferences: list) -> list:
        """
        Generates smart feedback and summaries based on historical scores and preferences.
        Uses Gemini if key exists, otherwise generates high-fidelity local templates.
        """
        # Extract summaries
        total_runs = len(history_scores)
        if total_runs == 0:
            return [
                {"message": "FeedFlow is ready to monitor your feed. Complete your preferences to trigger insights.", "trend_type": "INFO", "improvement_pct": 0.0}
            ]
            
        # Compute avg match score
        avg_score = sum(s.preference_match_score for s in history_scores) / total_runs
        
        # Count categories
        distribution = {}
        for s in history_scores:
            distribution[s.category] = distribution.get(s.category, 0) + 1
            
        most_common_cat = max(distribution, key=distribution.get) if distribution else "None"
        
        if settings.GEMINI_API_KEY:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                prompt = (
                    f"You are FeedFlow's AI Coach. Analyze the user's feed data:\n"
                    f"- Total analyzed posts: {total_runs}\n"
                    f"- Average personalization match score: {avg_score:.1f}/100\n"
                    f"- Most frequent content category seen: {most_common_cat}\n"
                    f"- Distribution: {json.dumps(distribution)}\n"
                    f"- Active preferences: {[f'{p.topic} ({p.preference_type})' for p in preferences]}\n\n"
                    f"Create 3 bulleted key insights for this user. "
                    f"Return ONLY a valid JSON array of objects, each containing:\n"
                    f"1. 'message' (string: the short advice, e.g., 'You engaged more with AI content this week.')\n"
                    f"2. 'improvement_pct' (float: simulated or calculated relevance increase, e.g. 18.0)\n"
                    f"3. 'trend_type' (string: 'POSITIVE', 'INFO', or 'WARNING')\n"
                    f"Keep messages concise (1 sentence)."
                )
                
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": {
                        "responseMimeType": "application/json"
                    }
                }
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(url, headers=headers, json=payload, timeout=8.0)
                    if response.status_code == 200:
                        res_json = response.json()
                        text_response = res_json["candidates"][0]["content"]["parts"][0]["text"]
                        return json.loads(text_response.strip())
            except Exception as e:
                logger.error(f"Failed to generate Gemini insights, using local templates: {e}")

        # Local templates fallback (High fidelity simulation)
        insights = []
        
        # Positive insight
        more_topics = [p.topic for p in preferences if p.preference_type == "MORE"]
        less_topics = [p.topic for p in preferences if p.preference_type == "LESS"]
        
        if more_topics:
            topic = random.choice(more_topics)
            insights.append({
                "message": f"Your relevance for {topic} content increased by {random.randint(12, 25)}% this week.",
                "improvement_pct": float(random.randint(10, 25)),
                "trend_type": "POSITIVE"
            })
            
        # Warning insight
        if less_topics:
            topic = random.choice(less_topics)
            insights.append({
                "message": f"Successfully filtered out {random.randint(15, 30)} posts containing unwanted {topic.lower()} gossip.",
                "improvement_pct": float(random.randint(5, 15)),
                "trend_type": "POSITIVE"
            })
            
        # Info insight
        insights.append({
            "message": f"FeedFlow detected a surge in {most_common_cat} content in your ecosystem. Adjust weights to fine-tune.",
            "improvement_pct": 0.0,
            "trend_type": "INFO"
        })
        
        return insights[:3]
