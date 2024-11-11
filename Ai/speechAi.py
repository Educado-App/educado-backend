from openai import OpenAI

client = OpenAI()

response = client.audio.speech.create(
    model="tts-1",
    voice="alloy",
    input="""

Fine-tuning lets you get more out of the models available through the API by providing:

Higher quality results than prompting
Ability to train on more examples than can fit in a prompt
Token savings due to shorter prompts
Lower latency requests
OpenAI's text generation models have been pre-trained on a vast amount of text. To use the models effectively, we include instructions and sometimes several examples in a prompt. Using demonstrations to show how to perform a task is often called "few-shot learning."

Fine-tuning improves on few-shot learning by training on many more examples than can fit in the prompt, letting you achieve better results on a wide number of tasks. Once a model has been fine-tuned, you won't need to provide as many examples in the prompt. This saves costs and enables lower-latency requests.

At a high level, fine-tuning involves the following steps:

Prepare and upload training data
Train a new fine-tuned model
Evaluate results and go back to step 1 if needed
Use your fine-tuned model
Visit our pricing page to learn more about how fine-tuned model training and usage are billed.

Which models can be fine-tuned?
Fine-tuning is currently available for the following models:

gpt-4o-2024-08-06
gpt-4o-mini-2024-07-18
gpt-4-0613
gpt-3.5-turbo-0125
gpt-3.5-turbo-1106
gpt-3.5-turbo-0613
You can also fine-tune a fine-tuned model, which is useful if you acquire additional data and don't want to repeat the previous training steps.

We expect gpt-4o-mini to be the right model for most users in terms of performance, cost, and ease of use.

When to use fine-tuning
Fine-tuning OpenAI text generation models can make them better for specific applications, but it requires a careful investment of time and effort. We recommend first attempting to get good results with prompt engineering, prompt chaining (breaking complex tasks into multiple prompts), and function calling, with the key reasons being:

There are many tasks at which our models may not initially appear to perform well, but results can be improved with the right prompts - thus fine-tuning may not be necessary
Iterating over prompts and other tactics has a much faster feedback loop than iterating with fine-tuning, which requires creating datasets and running training jobs
In cases where fine-tuning is still necessary, initial prompt engineering work is not wasted - we typically see best results when using a good prompt in the fine-tuning data (or combining prompt chaining / tool use with fine-tuning)
Our prompt engineering guide provides a background on some of the most effective strategies and tactics for getting better performance without fine-tuning. You may find it helpful to iterate quickly on prompts in our playground.

Common use cases
Some common use cases where fine-tuning can improve results:

Setting the style, tone, format, or other qualitative aspects
Improving reliability at producing a desired output
Correcting failures to follow complex prompts
Handling many edge cases in specific ways
Performing a new skill or task that’s hard to articulate in a prompt
One high-level way to think about these cases is when it’s easier to "show, not tell". In the sections to come, we will explore how to set up data for fine-tuning and various examples where fine-tuning improves the performance over the baseline model.

Another scenario where fine-tuning is effective is reducing cost and/or latency by replacing a more expensive model like gpt-4o with a fine-tuned gpt-4o-mini model. If you can achieve good results with gpt-4o, you can often reach similar quality with a fine-tuned gpt-4o-mini model by fine-tuning on the gpt-4o completions, possibly with a shortened instruction prompt.
""",
)

response.stream_to_file("output.mp3")