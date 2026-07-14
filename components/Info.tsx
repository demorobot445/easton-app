import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";

type Props = {
  setActiveInfo: React.Dispatch<React.SetStateAction<boolean>>;
  activeInfo: boolean;
};

const Info: React.FC<Props> = ({ activeInfo, setActiveInfo }) => {
  const container = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setActiveInfo(false);
  };

  useGSAP(
    () => {
      if (!activeInfo) {
        gsap
          .timeline({ delay: 0.5 })
          .set(".owner-img", { opacity: 0 })
          .set(".text", { opacity: 0 });
      } else {
        gsap
          .timeline({ delay: 0.5 })
          .to(".owner-img", { opacity: 1 })
          .to(".text", { opacity: 1, stagger: 0.2 }, "<0.4");
      }
    },
    { scope: container, dependencies: [activeInfo] },
  );

  return (
    <div
      ref={container}
      data-lenis-prevent
      data-active={activeInfo}
      className="hidden-scrollbar pointer-events-none fixed inset-0 z-50 grid h-full w-full grid-cols-4 grid-rows-[16px_1fr] overflow-auto bg-black/40 p-5 text-white opacity-0 backdrop-blur-md transition-opacity duration-500 data-[active='true']:pointer-events-auto data-[active='true']:opacity-100"
    >
      {/* Header / Close Button */}
      <div className="col-span-4 flex items-start justify-end">
        <button
          onClick={handleClose}
          onTouchEnd={handleClose}
          className="cursor-pointer text-xs font-bold tracking-wide uppercase transition-opacity hover:opacity-70"
        >
          Close
        </button>
      </div>

      {/* Intro Text */}
      <div className="col-span-4 flex flex-col gap-10 md:pt-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="flex items-center justify-center md:col-span-4">
            <Image
              className="owner-img w-full max-w-36 object-contain opacity-0 md:col-span-1 lg:max-w-50"
              src="/owner.jpg"
              alt="owner"
              width={200}
              height={274}
            />
          </div>
          <div className="mx-auto flex max-w-200 flex-col items-center justify-center gap-10 md:col-span-4">
            <p className="text max-w-300 text-center text-sm font-medium lg:text-base">
              With his exceptional talent and keen eye to transform someone’s
              image and bring the best out in them, Easton has been shooting for
              over 15 years and marking his space in the industry as a sought
              after visionary. Starting in fashion and learning from masters,
              such as Stephen Klein and Stephen Lippman, he has built a
              portfolio of diverse work, making musicians, actors and models
              feel like the most beautiful person in the world. “When in front
              of Easton’s lens, everything else drops out and I can be my true
              self, my best self – how I want to be seen.” His versatility comes
              from being in front of the lens and everywhere in between, the
              connection he makes with his subject is undeniable.
            </p>
            <p className="text max-w-300 text-center text-sm font-medium lg:text-base">
              Easton lives and loves in his home of Los Angeles with his fiancé
              and his cat Punk, where he finds inspiration in the beauty of the
              world and the people that inhabit it. He sees the world in
              technicolor, sometimes twisted, but always romantic.
            </p>
            {/* <div className="flex flex-col">
              <span className="font-medium">STUDIO</span>
              <Link
                className="font-medium"
                href="mailto:easton@eastonschirra.com"
              >
                easton@eastonschirra.com
              </Link>
            </div> */}
          </div>
        </div>
      </div>
      {/* <InfoForm /> */}

      {/* Sidebar Info */}
      {/* <aside className="col-span-4 flex flex-col gap-[30px] text-black md:col-span-1"> */}
      {/* Contact Section */}
      {/* <Section>
          {contactInfo.map((item, idx) => (
            <Link
              href={item.href}
              key={idx}
              className="contact-text font-serif text-[1.0625rem] leading-[1.3125rem] italic first:mb-4"
            >
              <span className="font-sans text-[.8562rem] not-italic">
                {item.label}
              </span>{" "}
              {item.value}
            </Link>
          ))}
        </Section> */}

      {/* Services Section */}
      {/* <Section title="Services">
          <ul className="font-serif text-[1.0625rem] leading-[1.3125rem]">
            {services.map((service, idx) => (
              <li key={idx}>{service}</li>
            ))}
          </ul>
        </Section> */}

      {/* Clients Section */}
      {/* <Section title="Clients">
          <div className="grid grid-cols-2 gap-x-6">
            {clients.map((group, groupIdx) => (
              <ul
                key={groupIdx}
                className="font-serif text-[1.0625rem] leading-[1.3125rem]"
              >
                {group.map((client, idx) => (
                  <li className="client-text" key={idx}>
                    {client}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </Section> */}
      {/* </aside> */}
    </div>
  );
};

// const Section = ({
//   title,
//   children,
// }: {
//   title?: string;
//   children: React.ReactNode;
// }) => (
//   <section className="flex flex-col pt-[30px]">
//     {title && (
//       <h3 className="mb-[17px] text-[.8562rem] leading-[1.3125rem]">{title}</h3>
//     )}
//     {children}
//   </section>
// );

export default Info;
