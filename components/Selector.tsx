"use client";

import { store } from "@/store";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import SplitText from "gsap/dist/SplitText";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";

gsap.registerPlugin(SplitText);

const creativeImages = [
  "/creative/0.jpg",
  "/creative/1.jpg",
  "/creative/2.jpg",
  "/creative/3.jpg",
  "/creative/4.jpg",
];

const commercialImages = [
  "/commercial/0.jpg",
  "/commercial/1.jpg",
  "/commercial/2.jpg",
  "/commercial/3.jpg",
  "/commercial/4.jpg",
];

const Selector = () => {
  const container = useRef<HTMLDivElement>(null);

  const [activeCate, setActiveCate] = useState<
    "creative" | "commerical" | "all"
  >("all");

  const [imageIndex, setImageIndex] = useState(0);

  const { selectorIsActive } = useSnapshot(store);

  // Change images every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % creativeImages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Initial text animation
  useGSAP(
    () => {
      const heading = SplitText.create(".main-heading", {
        mask: "lines",
        type: "chars, lines",
      });

      gsap.set(heading.chars, { yPercent: 100 });

      gsap
        .timeline()
        .to(heading.chars, {
          yPercent: 0,
          stagger: 0.06,
          delay: 0.5,
          duration: 0.8,
        })
        .to(".text-reveal", { opacity: 1, duration: 0.8 }, "<0.4")
        .to(".cate-reveal", { opacity: 1, duration: 0.8 });
    },
    { scope: container },
  );

  // Selector show/hide animation
  useGSAP(
    () => {
      gsap
        .timeline()
        .call(() => {
          store.activeCate = activeCate;
        })
        .to(container.current, {
          autoAlpha: selectorIsActive ? 1 : 0,
          duration: 1.5,
        });
    },
    {
      scope: container,
      dependencies: [activeCate, selectorIsActive],
    },
  );

  // Image fade animation on change
  // useGSAP(
  //   () => {
  //     gsap.fromTo(
  //       ".slider-image",
  //       { opacity: 0.4, scale: 1.05 },
  //       {
  //         opacity: 1,
  //         scale: 1,
  //         duration: 0.8,
  //         ease: "power2.out",
  //       },
  //     );
  //   },
  //   {
  //     dependencies: [imageIndex],
  //   },
  // );

  return (
    <div ref={container} className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Heading */}
      <div className="absolute top-12 left-1/2 z-10 -translate-x-1/2 text-center text-white">
        <p className="text-reveal mb-2 text-sm tracking-[0.3em] uppercase opacity-0">
          PICK A WORLD
        </p>

        <h1 className="main-heading text-5xl font-bold uppercase md:text-7xl">
          EASTON SCHIRRA
        </h1>
      </div>

      {/* Categories */}
      <div className="flex h-full w-full">
        {/* Creative */}
        <button
          onClick={() => {
            setActiveCate("creative");
            store.selectorIsActive = false;
          }}
          className="relative h-full w-1/2 cursor-pointer overflow-hidden transition-[filter] duration-500 hover:grayscale-100"
        >
          <Image
            key={`creative-${imageIndex}`}
            className="slider-image h-full w-full object-cover"
            src={creativeImages[imageIndex]}
            alt="creative-img"
            width={1920}
            height={1080}
            priority
          />

          <span className="cate-reveal absolute bottom-24 left-1/2 -translate-x-1/2 text-2xl font-medium text-white uppercase opacity-0">
            Creative
          </span>
        </button>

        {/* Commercial */}
        <button
          onClick={() => {
            setActiveCate("commerical");
            store.selectorIsActive = false;
          }}
          className="relative h-full w-1/2 cursor-pointer overflow-hidden transition-[filter] duration-500 hover:grayscale-100"
        >
          <Image
            key={`commercial-${imageIndex}`}
            className="slider-image h-full w-full object-cover"
            src={commercialImages[imageIndex]}
            alt="commercial-img"
            width={1920}
            height={1080}
            priority
          />

          <span className="cate-reveal absolute bottom-24 left-1/2 -translate-x-1/2 text-2xl font-medium text-black uppercase opacity-0">
            Commercial
          </span>
        </button>
      </div>
    </div>
  );
};

export default Selector;
