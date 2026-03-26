"use client";
import { useState, useEffect, JSX } from "react";
import { AiFillAudio } from "react-icons/ai";
import MyStopwatch from "../stopwatch";

interface AudioRecordProps {
  setAudio: (file: Blob | null) => void;
}

const AudioRecord = ({ setAudio }: AudioRecordProps): JSX.Element => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleClick = async (
    e:
      | React.MouseEvent<HTMLDivElement>
      | React.KeyboardEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isRecording && mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        return;
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      setStream(newStream);

      const newMediaRecorder = new MediaRecorder(newStream);
      setMediaRecorder(newMediaRecorder);

      const audioChunks: BlobPart[] = [];

      newMediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      newMediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);

        // Workaround for Chromium browsers where audio.duration is Infinity
        const checkDuration = () => {
          if (audio.duration === Infinity) {
            audio.currentTime = Number.MAX_SAFE_INTEGER;
            audio.ontimeupdate = () => {
              audio.ontimeupdate = null;
              audio.currentTime = 0;
              if (audio.duration <= 2 || audio.duration > 180) {
                console.log(`Audio duration: ${audio.duration}`);
                // Audio duration is significantly outside the allowed range
                setAudio(null);
              } else {
                setAudio(audioBlob);
              }
            };
          } else {
            if (audio.duration <= 2 || audio.duration > 180) {
              console.log(`Audio duration: ${audio.duration}`);
              setAudio(null);
            } else {
              setAudio(audioBlob);
            }
          }
        };
        audio.onloadedmetadata = checkDuration;
        // In some browsers, loadedmetadata may have already fired
        if (audio.readyState >= 1) {
          checkDuration();
        }

        newStream.getTracks().forEach((track) => track.stop());
      };

      newMediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  return (
    <div
      className="cursor-pointer rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void handleClick(event);
        }
      }}
      aria-label="Record audio"
    >
      <AiFillAudio
        color={isRecording ? "var(--error)" : "currentColor"}
        title="Click to record audio. Click again to stop."
        size={16}
      />

      {isRecording && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="mx-4 flex max-w-lg flex-col items-center gap-6 rounded-3xl border border-border bg-surface p-10 shadow-2xl">
            <div className="flex size-20 items-center justify-center rounded-full bg-error/20 animate-pulse">
              <AiFillAudio className="text-error size-10" />
            </div>
            <div className="text-center">
              <span className="mb-2 block text-2xl font-semibold text-text-primary">
                Voice Recording
              </span>
              <p className="text-text-muted text-base leading-relaxed">
                Recording your message. Speak clearly and press anywhere to stop.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 px-6 py-3">
              <MyStopwatch />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (mediaRecorder) mediaRecorder.stop();
                setIsRecording(false);
              }}
              className="mt-4 rounded-xl bg-error px-8 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-all hover:bg-error/90"
              type="button"
            >
              Stop Recording
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecord;
