"use client";
import { useState, useEffect, JSX } from "react";
import { AiFillAudio } from "react-icons/ai";

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
        audio: true,
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

        audio.onloadeddata = () => {
          if (audio.duration <= 2 || audio.duration > 300) {
            setAudio(null);
          } else {
            setAudio(audioBlob);
          }
        };

        newStream.getTracks().forEach((track) => track.stop());
      };

      newMediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      // You might want to add proper error handling UI here
    }
  };

  return (
    <div
      className="hover:bg-violet-300 transition-colors duration-300 p-2 rounded-full cursor-pointer"
      onClick={handleClick}
    >
      <AiFillAudio color={isRecording ? "red" : "currentColor"} />
    </div>
  );
};

export default AudioRecord;
