import { store } from "@/store";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useSnapshot } from "valtio";
import Filter from "./Filter";
import { useGSAPContext } from "@/context/GSAPContext";

type Props = {
  setActiveInfo: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveContact: React.Dispatch<React.SetStateAction<boolean>>;
};

const Header: React.FC<Props> = ({ setActiveInfo, setActiveContact }) => {
  const { activeCate } = useSnapshot(store);
  const container = useRef<HTMLDivElement>(null);

  const tl = useRef<GSAPTimeline>(null);
  const { filterTl } = useGSAPContext();

  const { pathname, push } = useRouter();

  useGSAP(
    () => {
      gsap.set(".filter-menu", { autoAlpha: 0 });

      tl.current = gsap
        .timeline({ reversed: pathname === "/" })
        .to(".close-btn", { autoAlpha: 0 }, "<0.2")
        .to(".text-reveal", { opacity: 0 }, "<")
        .to(".main-reveal", { opacity: 0 }, "<0.2")
        .to(".navigation", { autoAlpha: 0 })
        .to(".blur-bg", { autoAlpha: 0 }, "<");

      filterTl.current = gsap
        .timeline({ reversed: true })
        .to(".filter-menu", { autoAlpha: 1 });
    },
    { scope: container },
  );

  return (
    <div ref={container}>
      <Filter />
      <header className="fixed inset-0 z-40 grid w-full grid-cols-[60px_1fr_60px] items-center justify-between self-start p-5 mix-blend-difference lg:grid-cols-3 2xl:p-9">
        <button
          className="group pointer-events-auto flex h-7 cursor-pointer items-center gap-3"
          onClick={() => {
            tl.current?.reversed(true);
            filterTl.current?.reversed(true);
          }}
          // onTouchEnd={() => {
          //   if (pathname === "/") tl.current?.reversed(!tl.current?.reversed());
          // }}
        >
          <div className="size-2.5 rotate-45 cursor-pointer bg-white transition-transform duration-300 group-hover:-rotate-45 lg:size-3.5"></div>
          <span className="text-xs leading-[100%] text-white uppercase mix-blend-difference lg:text-base">
            Menu
          </span>
        </button>

        <Link
          onClick={() => {
            store.selectorIsActive = true;
            tl.current?.reversed(true);
            filterTl.current?.reversed(true);
          }}
          className="font-display pointer-events-auto text-center text-base font-bold text-white uppercase lg:text-xl"
          href="/"
        >
          EASTON SCHIRRA
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            tl.current?.reversed(false);
            if (pathname === "/") filterTl.current?.reversed(false);
          }}

          className="close-btn relative z-50 flex h-7 cursor-pointer items-center justify-end text-xs tracking-wide text-white uppercase transition-opacity hover:opacity-70 lg:text-base"
        >
          <span className="mt-0.5 leading-none">Close</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="size-6 lg:size-8"
          >
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
          </svg>
        </button>
        {/* <div className="size-5" /> */}
      </header>
      <div className="blur-bg pointer-events-none fixed inset-0 z-30 backdrop-blur-sm" />
      <nav
        onClick={() => {
          tl.current?.reversed(false);
          if (pathname === "/") filterTl.current?.reversed(false);
        }}
        // onTouchEnd={() => {
        //   if (pathname === "/") tl.current?.reversed(false);
        // }}
        // data-blend={!(pathname === "/")}
        className="navigation fixed inset-0 z-30 flex h-full w-full flex-col justify-between text-white mix-blend-difference"
      >
        <div className="h-19 2xl:h-28" />
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col gap-2 lg:gap-3"
        >
          <span className="main-reveal text-center text-xs leading-none font-semibold uppercase lg:text-base">
            <Link
              onTouchEnd={() => {
                if (pathname === "/") push("/projects");
              }}
              onClick={() => {
                tl.current?.reversed(false);
                filterTl.current?.reversed(true);
              }}
              href="/projects"
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
            <span className="text-reveal translate-y-15 text-center text-xs leading-none font-semibold text-white md:translate-y-0 lg:text-base">
              CLICK TO EXPLORE
            </span>
          )}
        </div>
        <div
          data-show={pathname === "/"}
          onClick={(e) => e.stopPropagation()}
          className="invisible flex h-19 items-center justify-center gap-1 text-center text-xs leading-none font-semibold data-[show='true']:visible lg:gap-2 lg:text-base 2xl:h-28"
        >
          <button
            data-bold={activeCate === "commercial"}
            className="cursor-pointer data-[bold='true']:font-bold"
            onClick={() => {
              store.activeCate = "commercial";
              store.subActiveCate = undefined;
            }}
          >
            COMMERCIAL
          </button>
          <span className="text-lg lg:text-2xl">/</span>
          <button
            data-bold={activeCate === "creative"}
            className="cursor-pointer data-[bold='true']:font-bold"
            onClick={() => {
              store.activeCate = "creative";
              store.subActiveCate = undefined;
            }}
          >
            CREATIVE
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Header;
