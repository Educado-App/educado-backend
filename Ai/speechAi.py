from openai import OpenAI

client = OpenAI()

response = client.audio.speech.create(
    model="tts-1",
    voice="alloy",
    input=  """
For at logge ud fra appen, følg disse trin:

1. Klik på **Perfil** i bunden af skærmen.
2. På **Perfil**-siden, find og klik på **Log ud**.

Du vil nu være logget ud af appen.
            """,
)

response.stream_to_file("output.mp3")


