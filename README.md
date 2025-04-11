# Culture Guide Chatbot

An AI-powered chatbot that provides information about cultures, traditions, and customs from around the world. Built using Flask and Google's Gemini AI.

## Features

- 🌍 **Culture-focused AI**: Provides information about cultures, traditions, foods, and customs from around the world
- 🚀 **Modern UI**: Beautiful, responsive interface with smooth animations and transitions
- 🌓 **Dark/Light Mode**: Automatically adapts to your system preferences
- 💬 **Interactive Chat**: Natural conversational experience with typing indicators
- 📱 **Mobile-friendly**: Fully responsive design that works on all devices
- 🔍 **Cultural Content Filter**: Only answers questions related to culture, traditions, and regions
- ⚡ **Quick Questions**: Predefined questions for easy exploration of different cultures
- 🔄 **Auto-saving**: Conversation history is saved in your browser
- 📋 **Copy to Clipboard**: Click on any response to copy it to your clipboard
- 🧹 **Clear Chat**: Easily clear your conversation history with one click
- 🚀 **Fast Loading**: Optimized performance for quick response times

## Requirements

- Python 3.7+
- Google Gemini API key (get one at [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd culture-guide-chatbot
   ```

2. Create a virtual environment and activate it:
   ```
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root directory and add your Google Gemini API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```

## Usage

1. Run the application:
   ```
   python3 web_chatbot_ui.py
   ```
   
   This will start the web server on the default port 5002.
   
   If you encounter a port conflict, use the `--auto-port` flag to automatically find an available port:
   ```
   python3 web_chatbot_ui.py --auto-port
   ```
   
   Or specify a custom port:
   ```
   python3 web_chatbot_ui.py --port 8080
   ```

2. Open your web browser and navigate to the URL shown in the terminal (typically http://127.0.0.1:5002)

3. Start asking questions about cultures, traditions, and customs from around the world!

## Customization

- **Appearance**: Edit the CSS files in the `static/css` directory
- **Behavior**: Modify the JavaScript in `static/js/main.js`
- **Content**: Adjust the AI prompt in the `get_response()` function in `web_chatbot_ui.py`

## Troubleshooting

- **API Key Issues**: Make sure your Google Gemini API key is correctly set in the `.env` file
- **Port Conflicts**: If the default port is in use, use the `--auto-port` flag
- **Browser Compatibility**: The application works best on modern browsers (Chrome, Firefox, Safari, Edge)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Google Gemini AI](https://deepmind.google/technologies/gemini/) for providing the AI model
- [Flask](https://flask.palletsprojects.com/) for the web framework
- [Shadcn UI](https://ui.shadcn.com/) for design inspiration 

## Deployment on Vercel

You can deploy this application on Vercel by following these steps:

1. **Install the Vercel CLI** (optional but recommended):
   ```
   npm install -g vercel
   ```

2. **Log in to Vercel** (if using CLI):
   ```
   vercel login
   ```

3. **Deploy using the Vercel CLI**:
   ```
   vercel
   ```
   
   Or deploy by connecting your GitHub repository in the Vercel dashboard:
   - Go to [Vercel](https://vercel.com/)
   - Sign up or log in with GitHub/GitLab/Bitbucket
   - Import your repository
   - Configure the project settings (set environment variables)
   - Deploy

4. **Configure Environment Variables**:
   During the deployment process, make sure to set up your environment variables:
   - `GOOGLE_API_KEY`: Your Google Gemini API key

5. **After Deployment**:
   - Once deployed, Vercel will provide you with a URL to access your application
   - Test that your application works correctly

This project is already configured for Vercel deployment with the `vercel.json` file and necessary directories. 