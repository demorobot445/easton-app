import { store } from "@/store";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

type Cate =
  | "LEBRITY"
  | "EDITORIAL"
  | "CAMPAIGN"
  | "BEAUTY"
  | "MUSIC"
  | "COMMERCIAL"
  | "MOVING"
  | "PERSONAL"
  | "ALL";

const Header = () => {
  const categories = [
    "LEBRITY",
    "EDITORIAL",
    "CAMPAIGN",
    "BEAUTY",
    "MUSIC",
    "COMMERCIAL",
    "MOVING",
    "PERSONAL",
  ];

  const container = useRef<HTMLElement>(null);

  const tl = useRef<GSAPTimeline>(null);

  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ reversed: true })
        .set(".drop-menu-box", { pointerEvents: "auto" })
        .to(".drop-menu-btn-texts", { y: 0, stagger: 0.1 })
        .to(".line-0", { scale: 0 }, "<");
    },
    { scope: container },
  );

  const handleEnter = () => {
    tl.current?.reversed(false);
  };

  const handleLeave = () => {
    tl.current?.reversed(true);
  };

  return (
    <header
      ref={container}
      className="fixed inset-0 z-30 flex h-fit w-full justify-between p-5"
    >
      <Image
        className="h-9 w-74 object-contain"
        src="/logo.png"
        alt="logo"
        height={100}
        width={400}
      />

      <div className="relative flex items-center gap-6 font-serif text-xl font-medium text-white uppercase">
        {/* WORK DROPDOWN */}
        <div
          className="relative"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <button className="font-instrument-serif flex cursor-pointer items-center gap-3">
            WORK
            <div className="relative size-4">
              <span className="line-0 absolute top-0 left-1/2 inline-block h-full w-0.5 -translate-x-1/2 bg-white"></span>
              <span className="line-1 absolute top-1/2 left-0 inline-block h-0.5 w-full -translate-y-1/2 bg-white"></span>
            </div>
          </button>

          <div className="drop-menu-box pointer-events-none absolute top-6 left-1/2 flex -translate-x-1/2 flex-col gap-2 p-3">
            {categories.map((elem, index) => {
              return (
                <button
                  key={index}
                  className="drop-menu-btns font-instrument-serif cursor-pointer overflow-hidden"
                  onClick={() => (store.activeCate = elem as Cate)}
                >
                  <span className="drop-menu-btn-texts inline-block translate-y-full">
                    {elem}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ABOUT */}
        <Link className="font-instrument-serif" href="/about">
          ABOUT
        </Link>

        {/* CONTACT */}
        <Link className="font-instrument-serif" href="/contact">
          CONTACT
        </Link>
      </div>
    </header>
  );
};

export default Header;
