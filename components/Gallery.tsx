import { initGallery } from "@/lib/gallery";
import { store } from "@/store";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { useSnapshot } from "valtio";

export default function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const gallery = useRef<any>(null);
  const router = useRouter();

  const { activeCate } = useSnapshot(store);

  useEffect(() => {
    if (!ref.current) return;

    initGallery(ref.current, router).then((g) => {
      gallery.current = g;
      g.updateCategory(activeCate as any);
    });

    return () => {
      gallery.current?.destroy();
    };
  }, []);

  useEffect(() => {
    gallery.current?.updateCategory(activeCate);
  }, [activeCate]);

  return (
    <div ref={ref} id="gallery" style={{ width: "100%", height: "100%" }} />
  );
}
