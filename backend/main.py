from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import shutil, uuid, os
import ffmpeg

from ai_models import text_ai, image_ai, audio_ai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- TEXT ----------------
class TextRequest(BaseModel):
    prompt: str

@app.post("/text")
async def text_endpoint(req: TextRequest):
    prompt = f"""
Answer clearly and helpfully in Hinglish.

User question:
{req.prompt}

AI answer:
"""
    result = text_ai(prompt, max_length=120)
    raw = result[0]["generated_text"]

    clean = raw.split("AI answer:")[-1].strip()

    return {"output": clean}

# ---------------- IMAGE ----------------
@app.post("/image")
async def image_endpoint(file: UploadFile = File(...)):
    path = f"temp_{uuid.uuid4()}.jpg"
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    image = Image.open(path)

    caption_result = image_ai(image)
    caption = caption_result[0]["generated_text"]

    description = (
        f"Is image me yeh dikh raha hai: {caption}. "
        f"Ye description poori image ke visual content ke base par generate hui hai."
    )

    return {
        "description": description
    }

# ---------------- AUDIO ----------------
@app.post("/audio")
async def audio_endpoint(file: UploadFile = File(...)):
    # Save input (mp4 / m4a / wav)
    input_path = f"temp_{uuid.uuid4()}_{file.filename}"
    wav_path = input_path.rsplit(".", 1)[0] + ".wav"

    with open(input_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Convert to wav (16kHz mono) – WhatsApp safe
    ffmpeg.input(input_path).output(
        wav_path, ac=1, ar="16000"
    ).run(overwrite_output=True, quiet=True)

    result = audio_ai(wav_path)

    return {
        "transcript": result["text"]
    }
