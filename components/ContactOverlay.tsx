import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Link from "next/link";
import { Contact } from "@/types/payload-types";

type Props = {
  setActiveInfo: React.Dispatch<React.SetStateAction<boolean>>;
  activeInfo: boolean;
};

const ContactOverlay: React.FC<Props> = ({ activeInfo, setActiveInfo }) => {
  const container = useRef<HTMLDivElement>(null);
  const [contactData, setContactData] = useState<Contact>();

  const fetchContact = async () => {
    const contactResponse = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/globals/contact?depth=2`,
    );

    const contactResult: Contact = await contactResponse.json();

    setContactData(contactResult);
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleClose = () => {
    setActiveInfo(false);
  };

  useGSAP(
    () => {
      if (!contactData) return;

      if (!activeInfo) {
        gsap.timeline({ delay: 0.5 }).set(".text", { opacity: 0 });
      } else {
        gsap.timeline({ delay: 0.5 }).to(".text", { opacity: 1, stagger: 0.2 });
      }
    },
    { scope: container, dependencies: [activeInfo, contactData] },
  );

  if (!contactData) return;

  return (
    <div
      ref={container}
      data-lenis-prevent
      data-active={activeInfo}
      className="hidden-scrollbar pointer-events-none fixed inset-0 z-50 grid h-full w-full grid-cols-4 grid-rows-[20px_1fr] overflow-auto bg-black/40 p-5 text-white opacity-0 backdrop-blur-md transition-opacity duration-500 data-[active='true']:pointer-events-auto data-[active='true']:opacity-100"
    >
      {/* Header / Close Button */}
      <div className="col-span-4 flex items-start justify-end">
        <button
          onClick={handleClose}
          onTouchEnd={handleClose}
          className="flex cursor-pointer items-center justify-center gap-1 text-xs font-bold tracking-wide uppercase transition-opacity hover:opacity-70"
        >
          <span className="mt-0.5 leading-none">Close</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="size-6"
          >
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
          </svg>
        </button>
      </div>

      {/* Intro Text */}
      <div className="col-span-4 flex flex-col items-center justify-center gap-10 text-2xl md:pt-8">
        <div className="grid gap-20 md:grid-cols-4">
          <div className="order-2 flex flex-col gap-10 md:order-1 md:col-span-4">
            <div className="flex flex-col items-center justify-center gap-3.5 text-sm">
              <span className="text font-medium">
                {contactData.firstAgency.label}
              </span>
              <Link
                className="text font-medium hover:underline"
                href={`mailto:${contactData.firstAgency.email}`}
              >
                {contactData.firstAgency.email}
              </Link>
              <span className="text font-medium">
                {contactData.secondAgency.label}
              </span>
              <span className="text font-medium uppercase">
                {contactData.secondAgency.tagline}
              </span>
              <Link
                className="text font-medium hover:underline"
                href={`mailto:${contactData.secondAgency.email}`}
              >
                {contactData.secondAgency.email}
              </Link>
              <Link
                className="text font-medium hover:underline"
                href={`tel:${contactData.secondAgency.phone}`}
              >
                {contactData.secondAgency.phone}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactOverlay;
