#!/usr/local/bin/python3
import sys
import os
from openai import OpenAI
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import prompt

app = Flask(__name__)

load_dotenv("../config/.env")

# Check if the OpenAI API key is loaded
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    print("Error: OPENAI_API_KEY not found in environment variables.")
    sys.exit(1)

# Set up your API key
client = OpenAI(api_key=api_key)

# Function to generate a chatbot response
def chatbot(userInput, currentPage):
    try:
        print(f"Calling OpenAI API with userInput: {userInput} and currentPage: {currentPage}")
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Ensure this is a valid model
            messages=[
                {"role": "system", "content": prompt.generatePrompt2()},
                {"role": "user", "content": userInput + currentPage}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error occurred while calling OpenAI API: {str(e)}")
        raise  # Re-raise the exception to handle it in the route

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    current_page = ", I'm on the homepage"  # Specify the current page

    if not user_input:
        return jsonify({'error': 'Message is required'}), 400
    
    try:
        response_text = chatbot(user_input, current_page)
        return jsonify({'response': response_text})
    except Exception as e:
        print(f"Error occurred in chatbot: {str(e)}")
        return jsonify({'error': 'An error occurred while processing your request.'}), 500

if __name__ == "__main__":
    print(chatbot("Hello", ", I'm on the homepage"))  
    app.run(port=5000)
