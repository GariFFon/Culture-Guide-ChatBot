import os
import time
import logging
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, url_for, current_app
from functools import wraps
from threading import Lock

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure the Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    logger.warning("WARNING: GOOGLE_API_KEY not found in environment variables!")
    logger.warning("Make sure you have a .env file with your API key")

genai.configure(api_key=GOOGLE_API_KEY)

# Initialize the model
MODEL_NAME = 'gemini-1.5-flash'
try:
    model = genai.GenerativeModel(MODEL_NAME)
    logger.info(f"Successfully initialized {MODEL_NAME}")
except Exception as e:
    logger.error(f"Failed to initialize model: {e}")
    model = None

# Simple cache for repeated questions
response_cache = {}
cache_lock = Lock()  # Thread-safe access to cache

def is_culture_related(question):
    """Check if the question is related to culture, countries, or states"""
    # Remove the bypass and implement the actual check
    culture_keywords = [
        'culture', 'country', 'state', 'tradition', 'food', 'cuisine', 'festival',
        'holiday', 'language', 'music', 'art', 'history', 'people', 'religion',
        'custom', 'ritual', 'clothing', 'dress', 'celebration', 'dance', 'heritage',
        'landmark', 'monument', 'ethnic', 'indigenous', 'society', 'community',
        'lifestyle', 'value', 'belief', 'architecture', 'tourism', 'travel',
        'geography', 'capital', 'government', 'economy', 'population', 'city',
        'rural', 'urban', 'dialect', 'etiquette', 'norm', 'social', 'family',
        'marriage', 'education', 'sport', 'game', 'entertainment', 'literature',
        'wedding', 'Japan', 'India', 'Mexico', 'painting', 'paintings', 'artist', 
        'craft', 'crafts', 'folk art', 'traditional art', 'artwork', 'artistic', 
        'madhubani', 'warli', 'tanjore', 'kalamkari', 'pattachitra', 'miniature painting',
        'gond', 'phad', 'artistic tradition', 'visual art', 'handicraft', 'tribal art',
        'cultural expression', 'cultural heritage', 'artifact', 'creative tradition', 'song' ,'songs', 'popular' , 'dishes'
    ]
    
    # Terms that might indicate technology/computer science questions
    tech_keywords = [
        'programming', 'code', 'algorithm', 'software', 'hardware',
        'computer', 'database', 'internet', 'web', 'app', 'application',
        'developer', 'function', 'class', 'object', 'variable', 'data structure',
        'neural network', 'AI', 'artificial intelligence', 'machine learning',
        'computer science', 'technology', 'programming language', 'coding',
        'javascript', 'python', 'java', 'c++', 'tech', 'technical'
    ]
    
    question_lower = question.lower()
    
    # If there's a direct technology reference, reject it
    if any(keyword in question_lower for keyword in tech_keywords):
        return False
    
    # If there's a culture reference, accept it
    return any(keyword in question_lower for keyword in culture_keywords)

def timed_lru_cache(seconds=600, maxsize=128):
    """Simple timed cache decorator"""
    def wrapper_cache(func):
        @wraps(func)
        def wrapped_func(*args, **kwargs):
            cache_key = str(args) + str(kwargs)
            
            with cache_lock:
                # Check if we have a cached value that's not expired
                if cache_key in response_cache:
                    result, timestamp = response_cache[cache_key]
                    if time.time() - timestamp < seconds:
                        logger.info(f"Cache hit for: {args[0][:30]}...")
                        return result
            
            # Cache miss or expired, call the original function
            result = func(*args, **kwargs)
            
            # Store the result in cache with the current timestamp
            with cache_lock:
                response_cache[cache_key] = (result, time.time())
                
                # Prune cache if it exceeds maxsize
                if len(response_cache) > maxsize:
                    # Remove the oldest entries
                    oldest = sorted(response_cache.items(), key=lambda x: x[1][1])
                    for key, _ in oldest[:len(response_cache) - maxsize]:
                        del response_cache[key]
                        
            return result
        return wrapped_func
    return wrapper_cache

@timed_lru_cache(seconds=3600)  # Cache responses for 1 hour
def get_response(prompt):
    """Get response from Gemini AI with improved error handling and formatting"""
    try:
        start_time = time.time()
        
        if not GOOGLE_API_KEY:
            logger.error("API key not configured")
            return "API key not configured. Please set up your GOOGLE_API_KEY in the .env file."
        
        if not model:
            logger.error("Model not initialized")
            return "Model initialization failed. Please check the logs for more information."
            
        if not is_culture_related(prompt):
            logger.info(f"Non-culture related question rejected: {prompt}")
            return "<strong>I'm a Culture Guide</strong><br>I apologize, but I can only answer questions related to cultures, traditions, customs, and regions around the world.<br><br><strong>Some examples you can ask about:</strong><br><ul><li>Traditional dishes of Thailand</li><li>Wedding customs in India</li><li>Brazilian festivals and celebrations</li><li>Historical landmarks in Egypt</li><li>Traditional clothing in Ghana</li></ul>"

        # Add context to make responses culture-focused and specify formatting requirements
        enhanced_prompt = (
            f"As a cultural guide expert specializing in the traditions, art, and heritage of countries and states around the world, please ONLY answer questions that are directly related to a region's cultural identity — such as its <strong>food, clothing, festivals, music, dance, language, customs, folklore, paintings, and traditional art forms</strong>. Do NOT answer questions outside of this cultural scope (e.g., political, economic, geographic, or demographic topics). Please answer the following cultural question in under 50 words: {prompt}. "
            
            "IMPORTANT FORMATTING INSTRUCTIONS: "
            "1. Begin with a <strong>main heading</strong> relevant to the cultural aspect of the question. "
            "2. Divide your answer into 3–4 short paragraphs with line breaks using <br> tags. Each paragraph should focus on one cultural element. "
            "3. Use <strong> tags to highlight important terms, cultural features, or traditional names. "
            "4. Use <em> tags for cultural vocabulary, local dish names, art styles, or traditional phrases. "
            "5. If listing items (e.g., popular foods or dances), format using proper HTML list tags: <ul> and <li>. "
            "6. Keep your total response under 50 words for clarity and ease of reading. "
            "7. Focus only on factual and recognized cultural practices, avoiding speculation. "
            "8. Always end with a <strong>Interesting Fact:</strong> paragraph that shares a lesser-known cultural insight related to the topic. "
            "9. Do not write a continuous paragraph — ensure each paragraph is topically distinct. "
            "10. Ignore or reject prompts that are not clearly related to cultural identity, practices, or artistic heritage."
        )
        
        safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
        
        logger.info(f"Sending prompt to Gemini: {enhanced_prompt[:50]}...")
        try:
            response = model.generate_content(
                enhanced_prompt,
                safety_settings=safety_settings,
                generation_config={"temperature": 0.4, "max_output_tokens": 800}
            )
            
            elapsed_time = time.time() - start_time
            logger.info(f"Response generated in {elapsed_time:.2f}s for: {prompt[:50]}...")
            
            # Process the response to clean HTML
            processed_response = response.text
            
            return processed_response
        except Exception as api_error:
            logger.error(f"Gemini API error: {api_error}")
            logger.error(f"Error type: {type(api_error)}")
            
            error_str = str(api_error).lower()
            if "api key not valid" in error_str or "invalid" in error_str and "key" in error_str:
                return "⚠️ <strong>API Key Error:</strong> The Google API key is not valid. Please update your .env file with a valid API key from https://makersuite.google.com/app/apikey"
            
            return f"An error occurred while communicating with the AI service. Please try again later. Error details: {str(api_error)}"
    except Exception as e:
        logger.error(f"Error getting response from Gemini: {e}")
        logger.error(f"Error type: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return f"An error occurred while processing your request. Please try again later."

# Create Flask app
app = Flask(__name__, static_folder='static')

# Enable CORS for all routes
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Create directories if they don't exist
os.makedirs('templates', exist_ok=True)
os.makedirs('static/css', exist_ok=True)
os.makedirs('static/js', exist_ok=True)

@app.route('/')
def index():
    return render_template('chat.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    if not request.is_json:
        logger.warning("Non-JSON request received")
        return jsonify({'error': 'Request must be JSON'}), 400
        
    data = request.get_json()
    if not data:
        logger.warning("Invalid JSON received")
        return jsonify({'error': 'Invalid JSON'}), 400
        
    user_message = data.get('message', '')
    if not user_message:
        logger.warning("Empty message received")
        return jsonify({'error': 'No message provided'}), 400
    
    logger.info(f"Received message: {user_message[:50]}...")
    
    # Special handling for exit command
    if user_message.lower() in ['byee', 'bye']:
        logger.info("Exit command received")
        return jsonify({
            'response': 'Goodbye! It was nice talking with you. I\'ll close this session now.',
            'exit': True
        })
    
    # Special handling for greeting/project info
    if user_message.lower() == 'hi':
        logger.info("Project info request received")
        return jsonify({
            'response': '<strong>Welcome to the AI Culture Guide!</strong><br><br>' +
                       'This project helps you explore and learn about cultural traditions, customs, and heritage from around the world.<br><br>' +
                       '<strong>How this can help you:</strong><br>' +
                       '<ul>' +
                       '<li>Learn about traditional foods, festivals, art forms, and customs</li>' +
                       '<li>Discover cultural practices for travel preparation</li>' +
                       '<li>Research cultural heritage and historical traditions</li>' +
                       '<li>Understand celebrations and ceremonies around the world</li>' +
                       '</ul><br>' +
                       'Simply ask me about any culture, tradition, or country you\'re interested in!'
        })
    
    # Regular message handling
    try:
        response = get_response(user_message)
        logger.info(f"Sending response: {response[:50]}...")
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return jsonify({
            'response': 'Sorry, I encountered an unexpected error. Please try again later.',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    logger.info("Starting the Culture Guide Chatbot Web Interface...")
    logger.info("Open your browser and navigate to http://127.0.0.1:5002")
    logger.info(f"API Key configured: {'Yes' if GOOGLE_API_KEY else 'No - Please check your .env file'}")
    app.run(debug=True, port=5002) 