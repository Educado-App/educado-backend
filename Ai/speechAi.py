import sys
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI()

def generate_audio(text_input):
    # Generate audio from text
    response = client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input=text_input,
    )
    return response.content  # Binary audio content

if __name__ == "__main__":

    if len(sys.argv) < 2:
        print("Error: No input text provided.", file=sys.stderr)
        sys.exit(1)

    text_input = sys.argv[1]

    try:
        # Assuming `generate_audio` is your function for generating audio
        audio_binary = generate_audio(text_input)

        # Output binary data to stdout
        sys.stdout.buffer.write(audio_binary)

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

