import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Link from "next/link";

type Props = {
  setActiveInfo: React.Dispatch<React.SetStateAction<boolean>>;
  activeInfo: boolean;
};

const ContactOverlay: React.FC<Props> = ({ activeInfo, setActiveInfo }) => {
  const container = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setActiveInfo(false);
  };

  useGSAP(
    () => {
      if (!activeInfo) {
        gsap.timeline({ delay: 0.5 }).set(".text", { opacity: 0 });
      } else {
        gsap.timeline({ delay: 0.5 }).to(".text", { opacity: 1, stagger: 0.2 });
      }
    },
    { scope: container, dependencies: [activeInfo] },
  );

  return (
    <div
      ref={container}
      data-lenis-prevent
      data-active={activeInfo}
      className="hidden-scrollbar pointer-events-none fixed inset-0 z-50 grid h-full w-full grid-cols-4 grid-rows-[20px_1fr] overflow-auto bg-black/40 p-5 text-white opacity-0 backdrop-blur-md transition-opacity duration-500 data-[active='true']:pointer-events-auto data-[active='true']:opacity-100"
    >
      {/* Header / Close Button */}
      <div className="col-span-4 flex items-start justify-end">
        <button
          onClick={handleClose}
          className="cursor-pointer text-xs font-bold tracking-wide uppercase transition-opacity hover:opacity-70"
        >
          Close
        </button>
      </div>

      {/* Intro Text */}
      <div className="col-span-4 flex flex-col items-center justify-center gap-10 text-2xl md:pt-8">
        <div className="grid gap-20 md:grid-cols-4">
          <div className="order-2 flex flex-col gap-10 md:order-1 md:col-span-4">
            <div className="flex flex-col items-center justify-center gap-3.5 text-sm">
              <span className="text font-medium">STUDIO</span>
              <Link
                className="text font-medium hover:underline"
                href="mailto:easton@eastonschirra.com"
              >
                easton@eastonschirra.com
              </Link>
              <span className="text font-medium">AGENCY REP</span>
              <span className="text font-medium uppercase">
                jose duarte at the only agency
              </span>
              <Link
                className="text font-medium hover:underline"
                href="mailto:jose@theonly.agency"
              >
                jose@theonly.agency
              </Link>
              <Link
                className="text font-medium hover:underline"
                href="tel:+1 310 756 9570"
              >
                +1 310 756 9570
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactOverlay;
