import { Project, projects } from "../../lib/projects";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
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
    fallback: "blocking", // or "blocking" for CMS later
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
  const [loaded, setLoaded] = useState(0);

  useGSAP(
    () => {
      if (images.length < 3) return;

      console.log(innerWidth - imageContainer.current!.scrollWidth);

      gsap
        .timeline({
          scrollTrigger: {
            trigger: container.current,
            scrub: 1,
            pin: true,
            pinSpacing: true,
            end: () => `${images.length * 0.5 * innerHeight}`,
          },
        })
        .to(imageContainer.current, {
          x: () => innerWidth - imageContainer.current!.scrollWidth,
        });
    },
    { scope: container },
  );

  useEffect(() => {
    if (loaded === images.length) {
      ScrollTrigger.refresh();
    }
  }, [loaded]);

  return (
    <>
      <Head>
        <title>{`Easton Schirra | ${project.name}`}</title>
      </Head>

      <section
        ref={container}
        className="flex h-screen w-full flex-col items-center justify-between bg-white"
      >
        {/* <div className="h-19 w-full 2xl:h-28" /> */}
        <div className="flex w-screen items-center justify-center overflow-hidden">
          <div ref={imageContainer} className="flex gap-7.5">
            {images.map((src, i) => (
              <Image
                onLoad={() => setLoaded((prev) => prev + 1)}
                key={i}
                onClick={() => setSelectedIndex(i)}
                className="h-screen cursor-pointer object-contain"
                src={src}
                alt={`gallery-${i}`}
                width={1024}
                height={1024}
              />
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-1/2 z-10 flex -translate-x-1/2 flex-col gap-2 p-5">
          <h1 className="text-center text-2xl font-medium">{project.name}</h1>
        </div>
      </section>
      {selectedIndex !== null && (
        <>
          <div className="fixed inset-0 z-20 flex flex-col items-center justify-between gap-4 bg-white">
            {/* <div className="h-19 w-full 2xl:h-28" /> */}
            <Image
              src={images[selectedIndex]}
              alt="preview"
              width={1920}
              height={1080}
              className="h-screen w-fit object-contain"
            />

            {/* Buttons */}
            <div className="fixed bottom-0 left-1/2 z-10 flex -translate-x-1/2 gap-2 p-5 font-medium text-white mix-blend-difference">
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
            className="fixed top-5 right-5 z-50 h-9 cursor-pointer px-4 font-medium text-white uppercase mix-blend-difference 2xl:top-9 2xl:right-9"
          >
            Back
          </button>
        </>
      )}
    </>
  );
}
