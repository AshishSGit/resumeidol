import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 160,
          height: 160,
          background: "#07090F",
          borderRadius: 36,
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Crown body */}
        <div
          style={{
            position: "absolute",
            left: 25,
            top: 34,
            width: 110,
            height: 80,
            background: "linear-gradient(135deg, #F5DC78, #C9A84C, #8B6410)",
            clipPath:
              "polygon(0% 100%, 0% 20%, 30% 57.5%, 50% 0%, 70% 57.5%, 100% 20%, 100% 100%)",
          }}
        />
        {/* Base bar */}
        <div
          style={{
            position: "absolute",
            left: 23,
            top: 114,
            width: 114,
            height: 15,
            background: "linear-gradient(90deg, #C9A84C, #F0CC60, #C9A84C)",
            borderRadius: 8,
          }}
        />
        {/* Center gem */}
        <div
          style={{
            position: "absolute",
            left: 71,
            top: 25,
            width: 18,
            height: 18,
            background: "#FFFBE8",
            borderRadius: 9999,
          }}
        />
        {/* Left gem */}
        <div
          style={{
            position: "absolute",
            left: 18,
            top: 43,
            width: 14,
            height: 14,
            background: "rgba(255,251,232,0.8)",
            borderRadius: 9999,
          }}
        />
        {/* Right gem */}
        <div
          style={{
            position: "absolute",
            left: 128,
            top: 43,
            width: 14,
            height: 14,
            background: "rgba(255,251,232,0.8)",
            borderRadius: 9999,
          }}
        />
      </div>
    ),
    { width: 160, height: 160 }
  );
}
