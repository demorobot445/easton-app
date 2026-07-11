import { store } from "@/store";
import { Project, Projects } from "@/types/payload-types";
import { getMediaAlt } from "@/utils/getMediaAlt";
import { getMediaUrl } from "@/utils/getMediaUrl";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const getStaticProps = (async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/projects?depth=2`,
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

  const [filterProjects, setFilterProjects] = useState<Project[]>(data);
  const [activeCate, setActiveCate] = useState<
    "creative" | "commercial" | null
  >(null);

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

  return (
    <>
      <Head>
        <title>Easton Schirra | Index</title>
      </Head>
      <section className="flex h-lvh w-full flex-col items-center justify-between bg-white">
        <div className="h-19 w-full 2xl:h-28" />
        <div className="hidden-scrollbar flex max-h-[50vh] min-w-[30vw] flex-col items-center overflow-y-auto">
          {filterProjects.map((elem, index) => {
            return (
              <Link
                className="text-center text-xs uppercase"
                key={index}
                href={`/projects/${elem.slug}`}
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
        {/* //gap-4 */}
        <div className="flex flex-col gap-1 p-5">
          <h1 className="text-center text-xs leading-none font-semibold">
            <button
              data-bold={activeCate === "commercial"}
              className="cursor-pointer data-[bold='true']:font-bold"
              onClick={() => {
                setActiveCate("commercial");
                setFilterProjects(data.filter((e) => e.cate === "commercial"));
              }}
            >
              COMMERCIAL
            </button>{" "}
            /{" "}
            <button
              data-bold={activeCate === "creative"}
              className="cursor-pointer data-[bold='true']:font-bold"
              onClick={() => {
                setActiveCate("creative");
                setFilterProjects(data.filter((e) => e.cate === "creative"));
              }}
            >
              CREATIVE
            </button>
          </h1>
          <Link
            onClick={() => {
              store.selectorIsActive = true;
            }}
            className="text-center text-xs font-medium"
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
