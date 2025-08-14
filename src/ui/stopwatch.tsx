import React from "react";
import { useStopwatch } from "react-timer-hook";

function MyStopwatch() {
  const { totalSeconds, milliseconds, seconds, minutes } = useStopwatch({
    autoStart: true,
    interval: 1000,
  });

  return (
    <div>
      <div className="text-md">
        <span>0{minutes}</span>:
        <span>{seconds < 10 ? `0${seconds}` : seconds}</span>
      </div>
    </div>
  );
}

export default MyStopwatch;
