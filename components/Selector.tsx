import { store } from "@/store";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import SplitText from "gsap/dist/SplitText";
import Image from "next/image";
import { useRef, useState } from "react";
import { useSnapshot } from "valtio";

const Selector = () => {
  const container = useRef<HTMLDivElement>(null);
  const [activeCate, setActiveCate] = useState<
    "creative" | "commerical" | "all"
  >("all");
  const { selectorIsActive } = useSnapshot(store);

  const { contextSafe } = useGSAP(
    () => {
      const heading = SplitText.create(".main-heading", {
        mask: "lines",
        type: "chars, lines",
      });

      gsap.set(heading.chars, { yPercent: 100 });

      gsap
        .timeline()
        .to(heading.chars, { yPercent: 0, stagger: 0.06, delay: 0.5 })
        .to(".text-reveal", { opacity: 1 }, "<0.4")
        .to(".cate-reveal", { opacity: 1 });
    },
    { scope: container },
  );

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
    { scope: container, dependencies: [activeCate, selectorIsActive] },
  );

  return (
    <div ref={container} className="fixed inset-0 z-50 flex h-full w-full">
      <div className="pointer-events-none absolute inset-1/2 z-30 flex h-fit w-full -translate-1/2 flex-col gap-6 text-white mix-blend-difference">
        <span className="text-reveal text-center text-2xl font-medium opacity-0">
          PICK A WORLD
        </span>
        <span className="main-heading text-center font-bold md:text-[8vw] md:leading-[120%]">
          EASTON SCHIRRA
        </span>
      </div>

      <button
        onClick={() => {
          setActiveCate("creative");
          store.selectorIsActive = false;
        }}
        className="relative h-full w-1/2 cursor-pointer transition-[filter] duration-500 hover:grayscale-100"
      >
        <Image
          className="h-full w-full object-cover"
          src="/creative.jpg"
          alt="creative-img"
          width={1920}
          height={1080}
        />
        <span className="cate-reveal absolute bottom-24 left-1/2 -translate-x-1/2 text-2xl font-medium text-white uppercase opacity-0">
          Creative
        </span>
      </button>
      <button
        onClick={() => {
          setActiveCate("commerical");
          store.selectorIsActive = false;
        }}
        className="relative h-full w-1/2 cursor-pointer transition-[filter] duration-500 hover:grayscale-100"
      >
        <Image
          className="h-full w-full object-cover"
          src="/commerical.jpg"
          alt="creative-img"
          width={1920}
          height={1080}
        />
        <span className="cate-reveal absolute bottom-24 left-1/2 -translate-x-1/2 text-2xl font-medium text-black uppercase opacity-0">
          Commerical
        </span>
      </button>
    </div>
  );
};

export default Selector;
