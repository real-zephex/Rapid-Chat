import React from "react";
import { useStopwatch } from "react-timer-hook";

function MyStopwatch() {
  const { seconds, minutes } = useStopwatch({
    autoStart: true,
    interval: 1000,
  });

  return (
    <div>
      <div className="font-mono text-base font-medium text-text-primary">
        <span>0{minutes}</span>:
        <span>{seconds < 10 ? `0${seconds}` : seconds}</span>
      </div>
    </div>
  );
}

export default MyStopwatch;
