import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
import { About } from "@/types/payload-types";
import { getMediaUrl } from "@/utils/getMediaUrl";
import { getMediaAlt } from "@/utils/getMediaAlt";

type Props = {
  setActiveInfo: React.Dispatch<React.SetStateAction<boolean>>;
  activeInfo: boolean;
};

const Info: React.FC<Props> = ({ activeInfo, setActiveInfo }) => {
  const [aboutData, setAboutData] = useState<About>();

  const container = useRef<HTMLDivElement>(null);

  const fetchAbout = async () => {
    const aboutResponse = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/globals/about?depth=2`,
    );

    const aboutResult: About = await aboutResponse.json();

    setAboutData(aboutResult);
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const handleClose = () => {
    setActiveInfo(false);
  };

  useGSAP(
    () => {
      if (!aboutData) return;

      if (!activeInfo) {
        gsap
          .timeline({ delay: 0.5 })
          .set(".owner-img", { opacity: 0 })
          .set(".text", { opacity: 0 });
      } else {
        gsap
          .timeline({ delay: 0.5 })
          .to(".owner-img", { opacity: 1 })
          .to(".text", { opacity: 1, stagger: 0.2 }, "<0.4");
      }
    },
    { scope: container, dependencies: [activeInfo, aboutData] },
  );

  if (!aboutData) return;

  return (
    <div
      ref={container}
      data-lenis-prevent
      data-active={activeInfo}
      className="hidden-scrollbar pointer-events-none fixed inset-0 z-50 grid h-full w-full grid-cols-4 grid-rows-[16px_1fr] overflow-auto bg-black/40 p-5 text-white opacity-0 backdrop-blur-md transition-opacity duration-500 data-[active='true']:pointer-events-auto data-[active='true']:opacity-100"
    >
      {/* Header / Close Button */}
      <div className="col-span-4 flex items-start justify-end">
        <button
          onClick={handleClose}
          onTouchEnd={handleClose}
          className="cursor-pointer text-xs font-bold tracking-wide uppercase transition-opacity hover:opacity-70"
        >
          Close <span className="ml-2 inline-block scale-150">✖</span>
        </button>
      </div>

      {/* Intro Text */}
      <div className="col-span-4 flex flex-col gap-10 md:pt-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="flex items-center justify-center md:col-span-4">
            <Image
              className="owner-img w-full max-w-36 object-contain opacity-0 md:col-span-1 lg:max-w-50"
              src={getMediaUrl(aboutData.portrait)}
              alt={getMediaAlt(aboutData.portrait)}
              width={200}
              height={274}
            />
          </div>
          <div className="mx-auto flex max-w-200 flex-col items-center justify-center gap-10 md:col-span-4">
            {aboutData.content.map((content, index) => {
              return (
                <p
                  key={index}
                  className="text max-w-300 text-center text-sm font-medium lg:text-base"
                >
                  {content.paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
