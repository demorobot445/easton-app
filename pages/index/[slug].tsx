import { Project, projects } from "@/lib/projects";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = projects.map((project) => ({
    params: { slug: project.slug },
  }));

  return {
    paths,
    fallback: false, // or "blocking" for CMS later
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const project = projects.find((p) => p.slug === params?.slug);

  if (!project) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      project,
    },
  };
};

export default function DynamicIndex({ project }: { project: Project }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const images = project.galleryMedia || [project.mediaSrc];

  const container = useRef<HTMLElement>(null);
  const imageContainer = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (imageContainer.current!.scrollWidth < innerWidth) return;

      gsap
        .timeline({
          scrollTrigger: {
            trigger: container.current,
            scrub: 1,
            pin: true,
            pinSpacing: true,
          },
        })
        .to(imageContainer.current, {
          x: innerWidth - imageContainer.current!.scrollWidth,
        });
    },
    { scope: container },
  );

  return (
    <>
      <Head>
        <title>{`Easton Schirra | ${project.name}`}</title>
      </Head>

      <section
        ref={container}
        className="flex h-screen w-full flex-col items-center justify-between bg-white"
      >
        <div className="h-19 w-full 2xl:h-28" />
        <div className="flex w-screen items-center justify-center overflow-hidden">
          <div
            ref={imageContainer}
            className="flex max-h-[70vh] w-fit gap-7.5 px-4 2xl:max-h-[75vh]"
          >
            {images.map((src, i) => (
              <Image
                key={i}
                onClick={() => setSelectedIndex(i)}
                className="h-93.5 w-[288px] cursor-pointer object-cover"
                src={src}
                alt={`gallery-${i}`}
                width={1024}
                height={1024}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 p-5">
          <h1 className="text-center text-2xl font-bold">{project.name}</h1>
        </div>
      </section>
      {selectedIndex !== null && (
        <>
          <div className="fixed inset-0 z-20 flex flex-col items-center justify-between gap-4 bg-white">
            <div className="h-19 w-full 2xl:h-28" />
            <Image
              src={images[selectedIndex]}
              alt="preview"
              width={1920}
              height={1080}
              className="h-[75vh] w-auto object-contain"
            />

            {/* Buttons */}
            <div className="flex gap-2 p-5 font-bold">
              <button
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev !== null
                      ? prev === 0
                        ? images.length - 1
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
                      ? prev === images.length - 1
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
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-5 right-5 z-50 h-9 cursor-pointer px-4 font-bold uppercase 2xl:top-9 2xl:right-9"
          >
            Back
          </button>
        </>
      )}
    </>
  );
}
