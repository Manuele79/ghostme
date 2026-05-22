"use client";

import { ReactNode } from "react";
import GhostGlobalStyles from "./GhostGlobalStyles";

export default function GhostLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen w-screen max-w-full overflow-x-hidden overflow-y-auto bg-black text-white">
       <GhostGlobalStyles />
      {/* glow globale */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_60%)]" />

      {/* stelle */}
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-[3px] w-[3px] rounded-full bg-cyan-200/80"
          style={{
            left: `${(i * 17) % 100}%`,
            top: `${(i * 31) % 100}%`,
            opacity: 0.2 + ((i % 5) * 0.15),
          }}
        />
      ))}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center overflow-x-hidden px-4 pb-4 pt-3">
        {children}
      </div>
    </main>   
   
  );
  
}