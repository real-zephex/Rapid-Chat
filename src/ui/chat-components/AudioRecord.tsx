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
    null
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
      className="p-2 rounded-lg text-gray-400 hover:bg-[#3f3f3f] transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <AiFillAudio
        color={isRecording ? "#ef4444" : "currentColor"}
        title="Click to record audio. Click again to stop."
        size={16}
      />

      {isRecording && (
        <div>
          <div className="fixed top-0 left-0 w-full h-full bg-black/80 backdrop-blur-sm flex items-center justify-center flex-col gap-3 z-[10000]">
            <div className="bg-[#2f2f2f] rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
              <span className="text-white text-xl font-semibold block text-center mb-2">
                Recording...
              </span>
              <p className="text-sm text-gray-400 text-center max-w-md mb-4">
                Press again to stop recording. Audio must be between 2 seconds
                and 3 minutes long.
              </p>
              <MyStopwatch />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecord;
