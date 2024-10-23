import os
from openai import OpenAI
from dotenv import load_dotenv
import prompt

# Set up your API key
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Function to generate a chatbot response
def chatbot(userInput):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
        {"role": "system", "content": prompt.generatePrompt2()},
        {
            "role": "user",
            "content": userInput
        }
    ]
    )
    return response.choices[0].message.content
    

# Main loop for conversation
while True:
    user_input = input("You: ")
    if user_input.lower() == "exit":
        break
    bot_response = chatbot(user_input)
    print(f"Bot: {bot_response}")



    