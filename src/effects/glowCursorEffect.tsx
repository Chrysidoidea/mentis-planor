"use client";

import { useEffect, useRef, useState } from "react";

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const animate = () => {
      setPos(prev => {
        const dx = target.current.x - prev.x;
        const dy = target.current.y - prev.y;
        const speed = 0.15; // lower = slower / smoother
        const newX = prev.x + dx * speed;
        const newY = prev.y + dy * speed;
        return { x: newX, y: newY };
      });
      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMove);
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf.current!);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 mix-blend-screen"
      style={{
        background: `radial-gradient(200px at ${pos.x}px ${pos.y}px, rgba(0, 200, 255, 0.25), transparent 80%)`,
        filter: "blur(40px)",
      }}
    />
  );
}