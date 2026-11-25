import { ArrowLeft, ArrowRight } from "@/components/Icons";
import { useGSAPContext } from "@/context/GSAPContext";
import { store } from "@/store";
import { Media, Project, Projects } from "@/types/payload-types";
import { getMediaAlt } from "@/utils/getMediaAlt";
import { getMediaUrl } from "@/utils/getMediaUrl";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";

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

// --- small helpers -------------------------------------------------------

function isMediaObject(media: Media | string): media is Media {
  return typeof media !== "string";
}

function isVideoMedia(media: Media): boolean {
  return !!media.mimeType?.includes("video");
}

function getAspectRatio(media: Media): string {
  const { width, height } = media;
  if (!width || !height) return "16 / 9"; // fallback
  return width > height ? "16 / 9" : "auto";
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export default function DynamicIndex({
  project,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { filterTl } = useGSAPContext();
  const { isMenuActive } = useSnapshot(store);

  const medias = project.galleryMedia || [project.heroMedia];

  const container = useRef<HTMLElement>(null);
  const imageContainer = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(0);

  const tl = useRef<GSAPTimeline>(null);

  // --- drag-to-scroll state ---
  const dragState = useRef({
    dragging: false,
    startX: 0,
    startScrollY: 0,
    moved: 0, // total absolute px moved, used to distinguish drag vs click
  });
  const [isDragging, setIsDragging] = useState(false);

  useGSAP(
    () => {
      if (medias.length < 3) return;

      tl.current = gsap
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
    if (medias.length > 0 && loaded >= medias.length) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }
  }, [loaded, medias.length]);

  // --- drag handlers: horizontal drag maps to vertical scroll ---
  useEffect(() => {
    const el = imageContainer.current;
    if (!el || medias.length < 3) return;

    function onPointerDown(e: PointerEvent) {
      dragState.current.dragging = true;
      dragState.current.startX = e.clientX;
      dragState.current.startScrollY = window.scrollY;
      dragState.current.moved = 0;
      setIsDragging(true);
      (e.target as Element).setPointerCapture?.(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragState.current.dragging) return;
      const deltaX = e.clientX - dragState.current.startX;
      dragState.current.moved = Math.max(
        dragState.current.moved,
        Math.abs(deltaX),
      );

      // dragging left (deltaX negative) -> scroll forward (down)
      // dragging right (deltaX positive) -> scroll backward (up)
      window.scrollTo({
        top: dragState.current.startScrollY - deltaX,
        behavior: "auto",
      });
    }

    function endDrag() {
      dragState.current.dragging = false;
      setIsDragging(false);
    }

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("pointerleave", endDrag);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("pointerleave", endDrag);
    };
  }, [medias.length]);

  // wrap the "open lightbox" click so a drag doesn't also trigger it
  function handleImageClick(i: number) {
    if (dragState.current.moved > 6) return; // was a drag, not a tap
    setSelectedIndex(i);
  }

  const goPrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? 0 : prev === 0 ? medias.length - 1 : prev - 1,
    );
  }, [medias.length]);

  const goNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? 0 : prev === medias.length - 1 ? 0 : prev + 1,
    );
  }, [medias.length]);

  const closeLightbox = useCallback(() => setSelectedIndex(null), []);

  // --- keyboard navigation for the lightbox ---
  useEffect(() => {
    if (selectedIndex === null) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex, goPrev, goNext, closeLightbox]);

  const selectedMedia =
    selectedIndex !== null && isMediaObject(medias[selectedIndex].media)
      ? (medias[selectedIndex].media as Media)
      : null;

  const [isCredit, setIsCredit] = useState(false);

  return (
    <>
      <Head>
        <title>{`Easton Schirra | ${project.name}`}</title>
      </Head>
      <Link
        data-disable={isMenuActive}
        href="/projects"
        onClick={() => filterTl.current?.reversed(false)}
        data-positive-index={selectedIndex === null}
        className="pointer-events-auto fixed top-5 right-0 flex h-7 cursor-pointer items-center justify-center px-4 text-xs font-medium text-white uppercase opacity-100 data-[disable='true']:pointer-events-none data-[disable='true']:opacity-0 data-[positive-index='true']:z-40 sm:px-5 lg:text-base 2xl:top-9"
      >
        <span className="mt-0.5 leading-none">Close</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 16 16"
          className="size-5 sm:size-6 lg:size-8"
        >
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
        </svg>
      </Link>
      <section
        ref={container}
        className="flex h-lvh w-full flex-col items-center justify-between bg-white"
      >
        <div className="flex h-lvh justify-center overflow-hidden">
          <div
            ref={imageContainer}
            className={`flex touch-none select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {medias.length === 0 && (
              <div className="flex h-full w-full items-center justify-center px-4 text-center">
                <p>No Media Found..!</p>
              </div>
            )}
            {medias.map((elem, i) => {
              if (!isMediaObject(elem.media)) return null;

              const media = elem.media;

              if (isVideoMedia(media)) {
                return (
                  <video
                    key={i}
                    onLoadedData={() => setLoaded((prev) => prev + 1)}
                    onClick={() => handleImageClick(i)}
                    className="h-lvh w-full object-cover"
                    src={getMediaUrl(media)}
                    muted
                    playsInline
                    controls
                  />
                );
              }

              const ratio = getAspectRatio(media);
              return (
                <Image
                  onLoad={() => setLoaded((prev) => prev + 1)}
                  key={i}
                  onClick={() => handleImageClick(i)}
                  data-width={ratio === "16 / 9"}
                  className="h-lvh w-full object-cover data-[width='true']:min-w-[280%] sm:data-[width='true']:min-w-[300%] md:data-[width='true']:min-w-auto"
                  src={getMediaUrl(media)}
                  alt={getMediaAlt(media)}
                  width={1024}
                  height={1024}
                  draggable={false}
                />
              );
            })}
          </div>
        </div>
        <div className="fixed bottom-5 left-0 z-20 flex w-full flex-col items-center justify-center gap-4 px-4 text-white mix-blend-difference sm:bottom-7.5">
          <p className="text-center text-xs leading-none font-semibold uppercase lg:text-base">
            {project.name}
          </p>
          <div className="h-4 md:hidden" />
        </div>
      </section>

      <div className="fixed bottom-5 left-0 z-22 flex w-full flex-col items-center justify-center gap-4 px-4 text-white mix-blend-difference sm:bottom-7.5 md:items-end">
        <button
          onClick={() => setIsCredit((prev) => !prev)}
          className="flex cursor-pointer items-center justify-center gap-0.5 text-center text-xs leading-none font-semibold uppercase lg:text-base"
        >
          {isCredit ? (
            <span className="mt-0.5">Close Credits</span>
          ) : (
            <>
              <span className="mt-0.5">Credits</span> <Plus />
            </>
          )}
        </button>
      </div>
      <div
        data-active={isCredit}
        className="pointer-events-none fixed inset-0 z-20 flex h-full w-full flex-col items-center justify-center gap-4 bg-black/20 text-white opacity-0 backdrop-blur transition-opacity duration-500 data-[active='true']:opacity-100"
      >
        <p className="text-center text-base leading-none font-semibold uppercase">
          {project.name}
        </p>
        {project.extraInfo.length > 0 && (
          <div className="flex flex-col gap-2">
            {project.extraInfo.map((elem, index) => (
              <p
                key={index}
                className="text-center text-xs leading-none uppercase lg:text-base"
              >
                {elem.value}
              </p>
            ))}
          </div>
        )}
        <p className="text-center text-base leading-none font-semibold uppercase">
          Easton Schirra
        </p>
      </div>

      {selectedIndex !== null && selectedMedia && (
        <>
          <div className="fixed inset-0 z-25 grid grid-rows-10 items-center bg-white">
            {/* Extra Info */}
            {/* {project.extraInfo.length > 0 && (
              <div className="absolute bottom-5 left-5 hidden flex-col gap-2 md:flex">
                {project.extraInfo.map((elem, index) => (
                  <p
                    key={index}
                    className="text-xs leading-none uppercase lg:text-base"
                  >
                    {elem.value}
                  </p>
                ))}
              </div>
            )} */}

            <div
              // data-space={project.extraInfo.length === 0}
              className="relative row-span-6 row-start-2 flex h-full w-full items-center justify-center data-[space='true']:row-span-7 data-[space='true']:row-start-2 md:row-span-7 md:row-start-2"
            >
              {/* <button
                type="button"
                aria-label="Previous"
                onClick={goPrev}
                className="absolute top-1/2 left-1 size-6 -translate-y-1/2 cursor-pointer sm:left-5 sm:size-8 md:size-10"
              >
                <ArrowLeft />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={goNext}
                className="absolute top-1/2 right-1 size-6 -translate-y-1/2 cursor-pointer sm:right-5 sm:size-8 md:size-10"
              >
                <ArrowRight />
              </button> */}

              {isVideoMedia(selectedMedia) ? (
                <video
                  src={getMediaUrl(selectedMedia)}
                  className="max-h-full max-w-full object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <Image
                  onClick={goNext}
                  src={getMediaUrl(selectedMedia)}
                  alt={getMediaAlt(selectedMedia)}
                  width={1920}
                  height={1080}
                  className="max-h-full max-w-full cursor-pointer object-contain"
                />
              )}
            </div>

            <div
              data-space={project.extraInfo.length === 0}
              className="row-start-8 flex flex-col items-center gap-3 text-xs leading-none font-medium data-[space='true']:row-start-9 md:row-start-9 lg:text-base"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={goPrev}
                  className="flex cursor-pointer items-center justify-center gap-1 uppercase"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
                    />
                  </svg>
                  <span className="mt-0.5">Prev</span>
                </button>
                <span>/</span>
                <button
                  onClick={goNext}
                  className="flex cursor-pointer items-center justify-center gap-1 uppercase"
                >
                  <span className="mt-0.5">Next</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"

                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
                    />
                  </svg>
                </button>
              </div>
              <span className="tabular-nums opacity-60">
                {pad2(selectedIndex + 1)}/{pad2(medias.length)}
              </span>
            </div>

            <div
              // data-space={project.extraInfo.length === 0}
              className="relative z-10 row-span-2 row-start-9 w-full p-5 data-[space='true']:row-span-1 data-[space='true']:row-start-10 md:row-span-1 md:row-start-10 md:p-0"
            >
              <p className="text-center text-xs leading-none font-semibold uppercase lg:text-base">
                {project.name}
              </p>
            </div>
          </div>

          <button
            onClick={closeLightbox}
            className="fixed top-5 right-0 z-50 h-7 cursor-pointer px-4 text-xs font-medium text-white uppercase mix-blend-difference lg:text-base 2xl:top-9 2xl:right-9"
          >
            Back
          </button>
        </>
      )}
    </>
  );
}

const Plus = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"

      viewBox="0 0 16 16"
    >
      <path
        strokeWidth="1"
        stroke="currentColor"
        d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"
      />
    </svg>
  );
};
