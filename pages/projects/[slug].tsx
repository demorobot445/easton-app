import { Project, Projects } from "@/types/payload-types";
import { getMediaAlt } from "@/utils/getMediaAlt";
import { getMediaUrl } from "@/utils/getMediaUrl";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export const getStaticPaths: GetStaticPaths = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/projects`,
  );

  const result: Projects = await res.json();

  return {
    paths: result.docs
      .filter((post) => post.slug)
      .map((post) => ({
        params: {
          slug: post.slug!,
        },
      })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<{
  project: Project;
}> = async ({ params }) => {
  const slug = params?.slug;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/projects?where[slug][equals]=${slug}&depth=2`,
  );

  const result: Projects = await res.json();

  if (!result.docs.length) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      project: result.docs[0],
    },
    revalidate: 60,
  };
};

export default function DynamicIndex({
  project,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const medias = project.galleryMedia || [project.heroMedia];

  const container = useRef<HTMLElement>(null);
  const imageContainer = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(0);

  useGSAP(
    () => {
      if (medias.length < 3) return;

      gsap
        .timeline({
          scrollTrigger: {
            trigger: container.current,
            scrub: 1,
            pin: true,
            pinSpacing: true,
            end: () => `${medias.length * 0.5 * innerHeight}`,
            invalidateOnRefresh: true,
          },
        })
        .to(imageContainer.current, {
          x: () => {
            const totalWidth = imageContainer.current!.scrollWidth;
            const viewportWidth = window.innerWidth;
            return viewportWidth - totalWidth;
          },
        });
    },
    { scope: container },
  );

  useEffect(() => {
    if (loaded === medias.length) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }
  }, [loaded]);

  return (
    <>
      <Head>
        <title>{`Easton Schirra | ${project.name}`}</title>
      </Head>
      <Link
        href="/projects"
        data-positive-index={selectedIndex === null}
        className="fixed top-9 right-5 cursor-pointer px-4 text-xs font-medium text-white uppercase mix-blend-difference data-[positive-index='true']:z-40 lg:top-5 lg:h-9 2xl:top-9 2xl:right-9"
      >
        CLOSE
      </Link>
      <section
        ref={container}
        className="flex h-lvh w-full flex-col items-center justify-between bg-white"
      >
        {/* <div className="h-19 w-full 2xl:h-28" /> */}
        <div className="flex h-lvh justify-center overflow-hidden">
          <div ref={imageContainer} className="flex">
            {medias.length === 0 && (
              <div className="flex h-full w-full items-center justify-center">
                <p>No Media Found..!</p>
              </div>
            )}
            {medias.map((elem, i) => {
              if (typeof elem.media === "string") return <></>;
              if (elem.media.mimeType?.includes("image")) {
                return (
                  <Image
                    onLoad={() => setLoaded((prev) => prev + 1)}
                    key={i}
                    onClick={() => {
                      setSelectedIndex(i);
                    }}
                    className="h-lvh w-full cursor-pointer object-cover"
                    src={getMediaUrl(elem.media)}
                    alt={getMediaAlt(elem.media)}
                    width={1024}
                    height={1024}
                  />
                );
              } else {
                return (
                  <video
                    onLoad={() => setLoaded((prev) => prev + 1)}
                    key={i}
                    className="h-lvh w-full object-cover"
                    src={getMediaUrl(elem.media)}
                    controls
                  />
                );
              }
            })}
          </div>
        </div>

        <div className="fixed bottom-7.5 left-0 z-10 w-full text-white mix-blend-difference">
          <p className="text-center text-xs leading-none font-semibold uppercase">
            {project.name}
          </p>
        </div>
      </section>
      {selectedIndex !== null && (
        <>
          <div className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-white">
            {/* <div className="h-19 w-full 2xl:h-28" /> */}
            <div className="flex h-[80%] flex-col items-center justify-center">
              <Image
                src={getMediaUrl(medias[selectedIndex].media)}
                alt="preview"
                width={1920}
                height={1080}
                className="h-[90%] object-contain"
              />
              <div className="mt-5 flex gap-1 text-xs leading-none font-medium">
                <button
                  onClick={() =>
                    setSelectedIndex((prev) =>
                      prev !== null
                        ? prev === 0
                          ? medias.length - 1
                          : prev - 1
                        : 0,
                    )
                  }
                  className="cursor-pointer uppercase"
                >
                  Prev
                </button>
                <span>/</span>
                <button
                  onClick={() =>
                    setSelectedIndex((prev) =>
                      prev !== null
                        ? prev === medias.length - 1
                          ? 0
                          : prev + 1
                        : 0,
                    )
                  }
                  className="cursor-pointer uppercase"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="fixed bottom-7.5 left-0 z-10 w-full">
              <p className="text-center text-xs leading-none font-semibold uppercase">
                {project.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedIndex(null)}
            className="fixed top-6.5 right-0 z-50 h-9 cursor-pointer px-4 text-xs font-medium text-white uppercase mix-blend-difference lg:top-4 2xl:top-9 2xl:right-9"
          >
            Back
          </button>
        </>
      )}
    </>
  );
}
