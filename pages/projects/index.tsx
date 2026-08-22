import { useGSAPContext } from "@/context/GSAPContext";
import { store } from "@/store";
import { Project, Projects } from "@/types/payload-types";
import { getMediaAlt } from "@/utils/getMediaAlt";
import { getMediaUrl } from "@/utils/getMediaUrl";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";

export const getStaticProps = (async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/projects?depth=2&limit=0`,
  );
  const result: Projects = await response.json();

  return {
    props: {
      data: result.docs,
    },
    revalidate: 60,
  };
}) satisfies GetStaticProps<{
  data: Project[];
}>;

interface HoveredImageProps {
  project: Project;
  position: {
    top: number;
    left: number;
  };
}

function HoveredImage({ position, project }: HoveredImageProps) {
  if (typeof project.heroMedia === "string") return <></>;
  if (project.heroMedia.mimeType?.includes("video")) {
    return (
      <video
        src={getMediaUrl(project.heroMedia)}
        className="pointer-events-none fixed z-10 w-64 object-cover transition-opacity duration-300"
        style={{
          top: position.top,
          left: position.left,
        }}
        autoPlay
        loop
        muted
        playsInline
      />
    );
  } else {
    return (
      <Image
        src={getMediaUrl(project.heroMedia)}
        alt={getMediaAlt(project.heroMedia)}
        className="pointer-events-none fixed z-10 w-64 object-cover transition-opacity duration-300"
        style={{
          top: position.top,
          left: position.left,
        }}
        width={1024}
        height={1024}
      />
    );
  }
}

export default function IndexPage({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [hovered, setHovered] = useState<Project | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isScrollable, setIsScrollable] = useState(false);

  const { filterTl } = useGSAPContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [filterProjects, setFilterProjects] = useState<Project[]>(data);
  const { subActiveCate, activeCate } = useSnapshot(store);

  const getSafePosition = () => {
    const imgWidth = 256; // w-64
    const imgHeight = 256;

    const margin = 20;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // center forbidden zone (adjust based on your layout)
    const center = {
      left: vw * 0.4,
      right: vw * 0.6,
      top: vh * 0.25,
      bottom: vh * 0.75,
    };

    let x, y;

    const isInsideCenter = (x: number, y: number) => {
      return (
        x + imgWidth > center.left &&
        x < center.right &&
        y + imgHeight > center.top &&
        y < center.bottom
      );
    };

    do {
      x = Math.random() * (vw - imgWidth - margin);
      y = Math.random() * (vh - imgHeight - margin);
    } while (isInsideCenter(x, y));

    return { top: y, left: x };
  };

  const handleFilter = () => {
    if (activeCate === "all") {
      setFilterProjects(data);
    } else {
      const filterCateData = data.filter(
        (e) => e.cate === activeCate.trim().toLowerCase(),
      );

      if (subActiveCate) {
        const filterData = filterCateData.filter(
          (e) =>
            e.subCate.trim().toLowerCase() ===
            subActiveCate.trim().toLowerCase(),
        );
        setFilterProjects(filterData);
      } else {
        setFilterProjects(filterCateData);
      }
    }
  };

  useEffect(() => {
    handleFilter();
  }, [subActiveCate, activeCate]);

  useEffect(() => {
    const el = scrollContainerRef.current;

    if (!el) return;

    const checkScroll = () => {
      setIsScrollable(el.scrollHeight > el.clientHeight);
    };

    // Initial check
    checkScroll();

    // Detect changes to the element's size
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, [filterProjects]);

  return (
    <>
      <Head>
        <title>Easton Schirra | Index</title>
      </Head>
      <section className="flex h-lvh w-full flex-col items-center justify-between bg-white">
        <div className="h-19 w-full 2xl:h-28" />
        <div>
          <div
            ref={scrollContainerRef}
            className="hidden-scrollbar flex max-h-[51vh] min-w-[30vw] flex-col items-center overflow-y-auto md:max-h-[50vh]"
          >
            {filterProjects.map((elem, index) => {
              return (
                <Link
                  className="text-center text-xs uppercase"
                  key={index}
                  href={`/projects/${elem.slug}`}
                  onClick={() => filterTl.current?.reversed(true)}
                  onMouseEnter={() => {
                    if (innerWidth > 1024) {
                      setHovered(elem);
                      setPosition(getSafePosition());
                    }
                  }}
                  onMouseLeave={() => {
                    if (innerWidth > 1024) setHovered(null);
                  }}
                >
                  {elem.name}
                </Link>
              );
            })}
          </div>
          <svg
            data-show={isScrollable}
            className="mx-auto mt-6 hidden size-6 data-[show='true']:block"
            fill="currentColor"
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 386.257 386.257"
            xmlSpace="preserve"
          >
            <polygon points="0,96.879 193.129,289.379 386.257,96.879 " />
          </svg>
        </div>
        {/* //gap-4 */}
        <div className="flex flex-col gap-1 p-5 lg:gap-2">
          <p className="text-center text-xs leading-none uppercase lg:text-base">
            SCROLL FOR MORE
          </p>
          <div className="flex gap-1 text-center text-xs leading-none font-semibold lg:gap-2 lg:text-base">
            <button
              data-bold={activeCate === "commercial"}
              className="cursor-pointer data-[bold='true']:font-bold"
              onClick={() => {
                store.activeCate = "commercial";
                store.subActiveCate = undefined;
                handleFilter();
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
                handleFilter();
              }}
            >
              CREATIVE
            </button>
          </div>
          <Link
            // onClick={() => {
            //   store.selectorIsActive = true;
            // }}
            className="text-center text-xs font-medium lg:text-base"
            href="/"
          >
            CLOSE INDEX
          </Link>
        </div>

        {hovered && <HoveredImage project={hovered} position={position} />}
      </section>
    </>
  );
}
