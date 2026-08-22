import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomMouse() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    if (!cursor) return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    if (!mediaQuery.matches) {
      cursor.style.display = "none";
      return;
    }

    const xTo = gsap.quickTo(cursor, "x", {
      duration: 0.25,
      ease: "power3.out",
    });

    const yTo = gsap.quickTo(cursor, "y", {
      duration: 0.25,
      ease: "power3.out",
    });

    const handleMouseMove = (event: MouseEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-19 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black text-center text-[10px] leading-tight font-medium tracking-[0.15em] text-white uppercase mix-blend-difference max-lg:hidden"
    >
      <span className="whitespace-nowrap">CLICK & DRAG TO EXPLORE</span>
    </div>
  );
}
