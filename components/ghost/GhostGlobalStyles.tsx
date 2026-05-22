"use client";

export default function GhostGlobalStyles() {
  return (
    <style jsx global>{`
      * {
        scrollbar-width: thin;
        scrollbar-color: rgba(34, 211, 238, 0.75) rgba(0, 0, 0, 0.35);
      }

      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.35);
        border-radius: 999px;
      }

      ::-webkit-scrollbar-thumb {
        background: rgba(34, 211, 238, 0.75);
        border-radius: 999px;
        box-shadow: 0 0 18px rgba(34, 211, 238, 0.45);
      }

      @keyframes ghostCorePulse {
        0%, 100% {
          transform: scale(0.96);
          opacity: 0.72;
        }
        50% {
          transform: scale(1.08);
          opacity: 1;
        }
      }

      @keyframes ghostOrbit {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes ghostReverseOrbit {
        from {
          transform: rotate(360deg);
        }
        to {
          transform: rotate(0deg);
        }
      }

      @keyframes ghostFlicker {
        0%, 100% {
          opacity: 0.35;
        }
        50% {
          opacity: 0.9;
        }
      }
    `}</style>
  );
}