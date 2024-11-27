import sys
import os
from openai import OpenAI
from dotenv import load_dotenv
import prompt
import json

load_dotenv("config/.env")

# Set up your API key
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
 

# Function to generate a chatbot response
def chatbot(userInput, courses):
    response = client.chat.completions.create(
        model="ft:gpt-4o-mini-2024-07-18:group-1-chatbotters:edu2:AUtL6885",
        messages=[
        {"role": "system", "content": prompt.generateUnifiedPrompt(courses)},
        {
            "role": "user",
            "content": (userInput)
        }
    ]
    )
    return response.choices[0].message.content 


# Check if the script is being executed directly
if __name__ == "__main__":
    
    input_data = sys.stdin.read().strip()
    
    if not input_data:
        print("No input provided!")
        sys.exit(2)
    try:
        data = json.loads(input_data)
        userInput = data.get("input")
        courses = data.get("courses")

        result = chatbot(userInput, courses)
        print(result)

    except json.JSONDecodeError:
        print("Invalid input format. Expected JSON.")
        sys.exit(1)
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        sys.exit(2)


# Main loop for backend testing
"""

print("hej")
while True:
    user_input = input("You: ")
    if user_input.lower() == "exit": 
        break
    bot_response = chatbot(user_input)
    print(f"Bot: {bot_response}")   
"""