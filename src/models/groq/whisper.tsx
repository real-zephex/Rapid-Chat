"use server";
import Groq from "groq-sdk";

const client = new Groq();

const Whisper = async (file: Blob) => {
  try {
    const transcription = await client.audio.transcriptions.create({
      file: new File([file], "audio.webm"),
      model: "distil-whisper-large-v3-en",
      response_format: "text",
    });
    return transcription;
  } catch (error) {
    console.error("Error during transcription:", error);
    return "Error during transcription";
  }
};

export default Whisper;
