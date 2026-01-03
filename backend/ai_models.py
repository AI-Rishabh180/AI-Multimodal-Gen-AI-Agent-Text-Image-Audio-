from transformers import pipeline
from PIL import Image

# Text (simple open-source)
text_ai = pipeline("text-generation", model="gpt2")

# Image
image_ai = pipeline(
    "image-to-text",
    model="Salesforce/blip-image-captioning-base"
)

# Audio (Whisper via HF)
audio_ai = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-small"
)
