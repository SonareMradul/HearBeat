import { useEffect, useState } from "react";
import { Headphones, Music2 } from "lucide-react";

export default function SplashScreen({ onFinish }) {
  const [showMusic, setShowMusic] = useState(false);

  useEffect(() => {
    const flipTimer = setInterval(() => {
      setShowMusic((prev) => !prev);
    }, 1500);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3200);

    return () => {
      clearInterval(flipTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center">
        <div
          className="mb-6"
          style={{
            perspective: "800px",
          }}
        >
          <div
            className="relative h-20 w-20"
            style={{
              transformStyle: "preserve-3d",
              transform: showMusic ? "rotateY(180deg)" : "rotateY(0deg)",
              transition: "transform 700ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Headphones
              size={72}
              strokeWidth={1.5}
              className="absolute inset-0 m-auto text-green-400"
              style={{
                backfaceVisibility: "hidden",
              }}
            />

            <Music2
              size={72}
              strokeWidth={1.5}
              className="absolute inset-0 m-auto text-green-400"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          HearBeat
        </h1>

        <p className="mt-3 text-sm md:text-base text-zinc-500 tracking-wide">
          Feel Every Beat
        </p>

        <div className="flex gap-1.5 mt-7">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span
            className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"
            style={{ animationDelay: "200ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"
            style={{ animationDelay: "400ms" }}
          />
        </div>
      </div>
    </div>
  );
}