"use server";
import Groq, {
  RateLimitError,
  InternalServerError,
  APIConnectionError,
  APIConnectionTimeoutError,
} from "groq-sdk";

const client = new Groq();

const MAX_RETRIES = 1;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (error: unknown): boolean =>
  error instanceof RateLimitError ||
  error instanceof InternalServerError ||
  error instanceof APIConnectionError ||
  error instanceof APIConnectionTimeoutError;

const Whisper = async (file: Blob) => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const transcription = await client.audio.transcriptions.create({
        file: new File([file], "audio.webm"),
        model: "whisper-large-v3-turbo",
        response_format: "text",
        language: "en",
      });
      return transcription;
    } catch (error) {
      lastError = error;
      console.error(
        `Transcription attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        error,
      );

      if (attempt < MAX_RETRIES && isRetryable(error)) {
        await sleep(1000 * Math.pow(2, attempt));
        continue;
      }

      break;
    }
  }

  throw lastError;
};

export default Whisper;
