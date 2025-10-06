import { fetchTranscript } from "youtube-transcript-plus";

interface YoutubeTranscriptionReturnProps {
  status: boolean;
  content?: string;
}

const YoutubeTranscription = async ({
  videoUrl,
}: {
  videoUrl: string;
}): Promise<YoutubeTranscriptionReturnProps> => {
  try {
    const transcript = await fetchTranscript(videoUrl, { lang: "en" });

    if (!transcript) {
      return {
        status: false,
        content: "No transcript available.",
      };
    }

    return {
      status: true,
      content: transcript
        .map((item) => item.text)
        .join(" ")
        .replaceAll("&amp;#39;", "'"),
    };
  } catch (error) {
    return {
      status: false,
      content:
        error instanceof Error
          ? error.message
          : "An error occurred while fetching the transcript.",
    };
  }
};

export default YoutubeTranscription;
