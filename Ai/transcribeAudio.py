import sys
import os
from openai import OpenAI
from io import BytesIO
from dotenv import load_dotenv

# Set up OpenAI API key
load_dotenv("config/.env")

# Set up your API key
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def transcribe(audio_data):
    try:
        # Use BytesIO to wrap stdin as a file-like object
        audio_file = BytesIO(audio_data.read())
        audio_file.name = "audio.mp3"

        transcription = client.audio.transcriptions.create(
          model="whisper-1", 
          file=audio_file
        )
        return transcription.text
    except Exception as e:  # Catch all exceptions here
        print(f"Error occurred during transcription: {str(e)}", file=sys.stderr)
        sys.exit(2)

if __name__ == "__main__":
    try:
        audio_data = sys.stdin.buffer  # Read binary data from stdin
        transcription_result = transcribe(audio_data)
        print(transcription_result)
    except Exception as e:
        print(f"Error occurred: {str(e)}", file=sys.stderr)
        sys.exit(2)
