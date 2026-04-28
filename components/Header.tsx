import { store } from "@/store";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
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
};

const Header: React.FC<Props> = ({ setActiveInfo }) => {
  const { activeCate } = useSnapshot(store);
  const container = useRef<HTMLDivElement>(null);

  const tl = useRef<GSAPTimeline>(null);

  const { pathname } = useRouter();

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
      <header className="fixed inset-0 z-30 flex h-fit w-full items-center justify-between p-5 mix-blend-difference 2xl:p-9">
        <button
          onClick={() => tl.current?.reversed(!tl.current?.reversed())}
          className="size-5 rotate-45 cursor-pointer bg-white transition-transform duration-300 hover:-rotate-45"
        ></button>

        <Link
          onClick={() => {
            store.selectorIsActive = true;
            tl.current?.reversed(true);
          }}
          className="text-center text-3xl font-bold text-white uppercase 2xl:text-4xl"
          href="/"
        >
          EASTON SCHIRRA
        </Link>
        <div className="size-5" />
      </header>
      <nav
        data-blend={!(pathname === "/")}
        className="navigation fixed inset-0 z-20 flex h-full w-full flex-col justify-between text-white backdrop-blur data-[blend='true']:text-black"
      >
        <div className="h-19 2xl:h-28" />
        <div className="flex flex-col gap-3.5">
          <span className="main-reveal text-center text-2xl font-bold uppercase">
            EASTON SCHIRRA <span className="px-2">/</span>{" "}
            <Link onClick={() => tl.current?.reversed(false)} href="/index">
              INDEX
            </Link>{" "}
            <span className="px-2">/</span>{" "}
            <button
              className="cursor-pointer"
              onClick={() => setActiveInfo(true)}
            >
              INFO & CONTACT
            </button>
          </span>
          {pathname === "/" && (
            <span className="text-reveal text-center">
              CLICK & DRAG TO EXPLORE
            </span>
          )}
        </div>
        <div className="flex h-19 items-center justify-center 2xl:h-28">
          {pathname === "/" && (
            <button
              onClick={() => tl.current?.reversed(false)}
              className="cate-reveal cursor-pointer text-center font-medium uppercase"
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
