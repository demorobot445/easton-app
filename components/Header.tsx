import { store } from "@/store";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useSnapshot } from "valtio";

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

type Props = {
  setActiveInfo: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveContact: React.Dispatch<React.SetStateAction<boolean>>;
};

const Header: React.FC<Props> = ({ setActiveInfo, setActiveContact }) => {
  const { activeCate } = useSnapshot(store);
  const container = useRef<HTMLDivElement>(null);

  const tl = useRef<GSAPTimeline>(null);

  const { pathname, push } = useRouter();

  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ reversed: pathname === "/" })
        .to(".cate-reveal", { opacity: 0 })
        .to(".text-reveal", { opacity: 0 }, "<0.2")
        .to(".main-reveal", { opacity: 0 }, "<0.2")
        .to(".navigation", { autoAlpha: 0 });
    },
    { scope: container },
  );

  return (
    <div ref={container}>
      <header className="pointer-events- fixed inset-0 z-40 grid h-22 w-full grid-cols-3 items-center justify-between p-5 mix-blend-difference lg:h-16 2xl:p-9">
        <button
          className="group pointer-events-auto flex cursor-pointer items-center gap-3"
          onClick={() => tl.current?.reversed(!tl.current?.reversed())}
          onTouchEnd={() => {
            if (pathname === "/") tl.current?.reversed(!tl.current?.reversed());
          }}
        >
          <div className="size-2.5 rotate-45 cursor-pointer bg-white transition-transform duration-300 group-hover:-rotate-45"></div>
          <span className="text-xs leading-[100%] text-white uppercase mix-blend-difference">
            Menu
          </span>
        </button>

        <Link
          onClick={() => {
            store.selectorIsActive = true;
            tl.current?.reversed(true);
          }}
          className="font-display pointer-events-auto text-center font-bold text-white uppercase"
          href="/"
        >
          EASTON SCHIRRA
        </Link>
        <div className="size-5" />
      </header>
      <nav
        onClick={() => tl.current?.reversed(false)}
        onTouchEnd={() => {
          if (pathname === "/") tl.current?.reversed(false);
        }}
        data-blend={!(pathname === "/")}
        className="navigation fixed inset-0 z-30 flex h-full w-full flex-col justify-between text-white mix-blend-difference backdrop-blur"
      >
        <div className="h-19 2xl:h-28" />
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col gap-1" //gap-3.5
        >
          <span className="main-reveal text-center text-xs leading-none font-semibold uppercase">
            <Link
              onTouchEnd={() => {
                if (pathname === "/") push("/index");
              }}
              onClick={() => tl.current?.reversed(false)}
              href="/index"
            >
              INDEX
            </Link>{" "}
            <span className="px-2">/</span>{" "}
            <button
              className="cursor-pointer"
              onClick={() => setActiveInfo(true)}
              onTouchEnd={() => {
                if (pathname === "/") setActiveInfo(true);
              }}
            >
              BIO
            </button>
            <span className="px-2">/</span>{" "}
            <button
              className="cursor-pointer"
              onClick={() => setActiveContact(true)}
              onTouchEnd={() => {
                if (pathname === "/") setActiveContact(true);
              }}
            >
              CONTACT
            </button>
          </span>
          {pathname === "/" && (
            <span className="text-reveal text-center text-xs leading-none font-thin text-white">
              CLICK & DRAG TO EXPLORE
            </span>
          )}
        </div>
        <div className="flex h-19 items-center justify-center 2xl:h-28">
          {pathname === "/" && (
            <button
              onClick={() => tl.current?.reversed(false)}
              className="cate-reveal cursor-pointer text-center text-xs leading-none font-semibold uppercase"
            >
              view {activeCate === "creative" ? "creative" : "commercial"}
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Header;
