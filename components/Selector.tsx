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
      gsap
        .timeline()
        .to(".slider-image", {
          opacity: 0,
          duration: 1,
          onComplete: () => {
            setImageIndex((prev) => (prev + 1) % creativeImages.length);
          },
        })
        .to(".slider-image", { opacity: 1, duration: 1 });
    }, 5000);

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

  return (
    <div ref={container} className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Heading */}
      <div className="absolute top-1/2 left-1/2 z-10 -translate-1/2 text-center text-white mix-blend-difference">
        <p className="text-reveal -mt-12 pb-9 font-sans text-xs leading-none font-semibold uppercase opacity-0">
          PICK A SIDE
        </p>

        <h1 className="main-heading font-display text-5xl font-light whitespace-nowrap uppercase md:text-8xl">
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
            className="slider-image h-full w-full object-cover"
            src={creativeImages[imageIndex]}
            alt="creative-img"
            width={1920}
            height={1080}
            priority
          />

          <span className="cate-reveal absolute bottom-7.5 left-1/2 -translate-x-1/2 text-xs leading-none font-semibold text-white uppercase opacity-0 mix-blend-difference">
            EXPLORE PERSONAL
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
            className="slider-image h-full w-full object-cover"
            src={commercialImages[imageIndex]}
            alt="commercial-img"
            width={1920}
            height={1080}
            priority
          />

          <span className="cate-reveal absolute bottom-7.5 left-1/2 -translate-x-1/2 text-xs leading-none font-semibold text-white uppercase opacity-0 mix-blend-difference">
            EXPLORE COMMERCIAL
          </span>
        </button>
      </div>
    </div>
  );
};

export default Selector;
