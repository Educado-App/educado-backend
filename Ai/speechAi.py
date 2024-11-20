import sys
from openai import OpenAI

client = OpenAI()

def audioBot(userInput):
    response = client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input=  userInput,
    )
    print(response)
    return response


if __name__ == "__main__":
    # Get userInput and currentPage from the command-line arguments
    if len(sys.argv) < 2:
        print("Error: Not enough arguments provided.")
        sys.exit(1)
    
    userInput = sys.argv[1]  # First command-line argument
    
    # Call the chatbot function and print the result
    try:
        result = audioBot(userInput)
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        sys.exit(1)

