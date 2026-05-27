"use client";
import { useState, useEffect, JSX } from "react";
import { AiFillAudio } from "react-icons/ai";
import { FiRefreshCw } from "react-icons/fi";
import MyStopwatch from "../stopwatch";

interface AudioRecordProps {
  setAudio: (file: Blob | null) => void;
  voiceLoading: boolean;
  transcriptionFailed: boolean;
  onRetry: () => void;
  clearRetry: () => void;
}

const AudioRecord = ({
  setAudio,
  voiceLoading,
  transcriptionFailed,
  onRetry,
  clearRetry,
}: AudioRecordProps): JSX.Element => {
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

    if (voiceLoading) return;

    if (transcriptionFailed) {
      clearRetry();
    }

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
    <>
      {transcriptionFailed ? (
        <>
          <button
            type="button"
            disabled={voiceLoading}
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            className="cursor-pointer rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary disabled:opacity-40"
            aria-label="Retry transcription"
          >
            <FiRefreshCw
              size={16}
              className={voiceLoading ? "animate-spin" : ""}
              title="Retry transcription"
            />
          </button>
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
            aria-label="Record new audio"
          >
            <AiFillAudio
              color="currentColor"
              title="Record new audio"
              size={16}
            />
          </div>
        </>
      ) : (
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
        </div>
      )}

      {isRecording && (
        <div className="fixed bottom-28 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-4 rounded-full border border-error/30 bg-surface/95 px-5 py-2.5 shadow-2xl backdrop-blur-md transition-all">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-error"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
              Recording
            </span>
          </div>
          
          <div className="font-mono text-sm font-bold text-text-primary">
            <MyStopwatch />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (mediaRecorder) mediaRecorder.stop();
              setIsRecording(false);
            }}
            className="ml-2 rounded-full bg-error/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-error transition-colors hover:bg-error/20"
            type="button"
          >
            Stop
          </button>
        </div>
      )}
    </>
  );
};

export default AudioRecord;
