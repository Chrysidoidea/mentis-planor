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
        const speed = 0.15;
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
      className="pointer-events-none fixed inset-0 z-0 mix-blend-screen"
      style={{
        background: `radial-gradient(300px at ${pos.x}px ${pos.y}px, rgba(55, 55, 55, 0.40), transparent 60%)`,
        filter: "blur(80px)",
      }}
    />
  );
}