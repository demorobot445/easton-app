import { initGallery } from "@/lib/gallery";
import { useEffect, useRef } from "react";

export default function Gallery() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    initGallery(ref.current);
  }, []);

  return (
    <div id="gallery" ref={ref} style={{ width: "100%", height: "100%" }} />
  );
}
