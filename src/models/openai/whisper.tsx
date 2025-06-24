"use server";
import OpenAI from "openai";

const client = new OpenAI();

const Whisper = async (file: Blob) => {
  try {
    const transcription = await client.audio.translations.create({
      file: file,
      model: "whisper-1",
      response_format: "text",
    });
    return transcription || "Transcription failed";
  } catch (error) {
    console.error("Error during transcription:", error);
    return "Error during transcription";
  }
};

export default Whisper;
