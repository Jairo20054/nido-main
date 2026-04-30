import os
import openai
import requests

# Load API keys from environment variables
from dotenv import load_dotenv
load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
QWEN_API_KEY = os.getenv("QWEN_API_KEY")

# DeepSeek 4 Pro Client
def deepseek_chat(messages, model="deepseek-ai/deepseek-v4-pro"):
    openai.api_key = DEEPSEEK_API_KEY
    return openai.ChatCompletion.create(
        model=model,
        messages=messages,
        temperature=1,
        top_p=0.95,
        max_tokens=16384,
        extra_body={"chat_template_kwargs": {"thinking": False}},
        stream=True
    )

# Qwen IA Client
def qwen_chat(messages, model="qwen/qwen3.5-397b-a17b"):
    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {QWEN_API_KEY}",
        "Accept": "application/json"
    }
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": 16384,
        "temperature": 0.6,
        "top_p": 0.95,
        "top_k": 20,
        "presence_penalty": 0,
        "repetition_penalty": 1,
        "stream": False,
        "chat_template_kwargs": {"enable_thinking": True},
    }
    response = requests.post(invoke_url, headers=headers, json=payload)
    return response.json()

# Example usage
if __name__ == "__main__":
    messages = [{"role": "user", "content": "Hello!"}]

    # Test DeepSeek
    print("DeepSeek Response:")
    for chunk in deepseek_chat(messages):
        if chunk.choices and chunk.choices[0].delta.content:
            print(chunk.choices[0].delta.content, end="")

    # Test Qwen
    print("\n\nQwen Response:")
    print(qwen_chat(messages))