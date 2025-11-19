import { useEffect, useState, useRef } from "react";

export function useSmoothStream(
    targetText: string,
    isStreaming: boolean = false,
    speed: number = 2, // Characters per frame (approx 60fps * 2 = 120 chars/sec base)
) {
    const [currentText, setCurrentText] = useState(
        isStreaming ? "" : targetText,
    );
    const requestRef = useRef<number | null>(null);
    const targetTextRef = useRef(targetText);

    // Keep ref updated without triggering effect
    useEffect(() => {
        targetTextRef.current = targetText;
    }, [targetText]);

    useEffect(() => {
        if (!isStreaming) {
            setCurrentText(targetText);
            return;
        }

        // If we are starting a new stream or the target text is shorter than current (reset),
        // snap to the new target immediately or reset.
        if (targetText.length < currentText.length) {
            setCurrentText(targetText);
            return;
        }

        const animate = () => {
            setCurrentText((prev) => {
                const target = targetTextRef.current;

                if (prev.length >= target.length) {
                    return prev;
                }

                // Calculate how much to add
                // If we are far behind, speed up
                const remaining = target.length - prev.length;
                const adaptiveSpeed = Math.max(speed, Math.ceil(remaining / 10));

                const nextLength = Math.min(prev.length + adaptiveSpeed, target.length);
                const nextText = target.slice(0, nextLength);

                if (nextLength < target.length) {
                    requestRef.current = requestAnimationFrame(animate);
                }

                return nextText;
            });
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [targetText, isStreaming, speed]);

    return currentText;
}
