import os
import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

try:
    import google.generativeai as genai
except ImportError:
    genai = None

logger = logging.getLogger(__name__)

@csrf_exempt
def generate_enhanced_prompt(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
        location = data.get('location', 'Luxury Showroom')
        
        api_key = os.getenv('GEMINI_API_KEY')
        logger.error(f"DEBUG: api_key={api_key}, genai={genai}")
        
        if not api_key or not genai:
            logger.warning("GEMINI_API_KEY not found or generativeai not installed. Falling back to local prompt generator.")
            # Graceful fallback so demo doesn't crash
            fallback_prompt = f"A highly detailed, hyper-realistic 8k resolution photo of a luxury car parked in {location}, cinematic lighting, photorealistic, reflections, ray tracing, unreal engine 5 render, award winning photography."
            return JsonResponse({"prompt": fallback_prompt})
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        # We instruct Gemini to act as a Midjourney/Stable Diffusion prompt engineer
        instruction = (
            f"You are an expert AI image generation prompt engineer. "
            f"A user wants to see their car parked in the following location/theme: '{location}'. "
            f"Write a highly descriptive, comma-separated prompt for a text-to-image AI (like Midjourney) "
            f"that describes a hyper-realistic background environment for this car. "
            f"Include lighting, camera angles, atmosphere, and visual quality tags. "
            f"Keep it under 50 words. Only return the prompt, no conversational text."
        )
        
        response = model.generate_content(instruction)
        enhanced_prompt = response.text.strip()
        
        return JsonResponse({"prompt": enhanced_prompt})
    except Exception as e:
        logger.error(f"Error generating enhanced prompt: {e}")
        # Final fallback in case of API failure (e.g., quota exceeded)
        fallback = f"A hyper-realistic 8k resolution photo of a luxury car parked in {location}, cinematic lighting, reflections."
        return JsonResponse({"prompt": fallback})
