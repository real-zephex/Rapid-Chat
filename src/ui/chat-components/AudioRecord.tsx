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

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
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
      className="p-2 rounded-lg text-text-muted hover:bg-surface-hover transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <AiFillAudio
        color={isRecording ? "var(--error)" : "currentColor"}
        title="Click to record audio. Click again to stop."
        size={16}
      />

      {isRecording && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-100">
          <div className="bg-surface rounded-3xl p-10 border border-border shadow-2xl flex flex-col items-center gap-6 max-w-lg mx-4">
            <div className="size-20 rounded-full bg-error/20 flex items-center justify-center animate-pulse">
              <AiFillAudio className="text-error size-10" />
            </div>
            <div className="text-center">
              <span className="text-text-primary text-2xl font-bold block mb-2 font-space-grotesk">
                Voice Recording
              </span>
              <p className="text-text-muted text-base leading-relaxed">
                Recording your message. Speak clearly and press anywhere to stop.
              </p>
            </div>
            <div className="bg-background/50 px-6 py-3 rounded-2xl border border-border">
              <MyStopwatch />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (mediaRecorder) mediaRecorder.stop();
                setIsRecording(false);
              }}
              className="mt-4 px-8 py-3 bg-error text-white font-bold rounded-xl hover:bg-error/90 transition-all uppercase tracking-widest text-xs"
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
