import { store } from "@/store";
import { SubCategories, SubCategory } from "@/types/payload-types";
import { gsap } from "gsap";
import { RefObject, useEffect, useState } from "react";
import { useSnapshot } from "valtio";

interface Props {
  filterBlurBgRef: RefObject<HTMLDivElement | null>;
}

const Filter: React.FC<Props> = ({ filterBlurBgRef }) => {
  const { subActiveCate } = useSnapshot(store);
  const [isActive, setIsActive] = useState(false);
  const [categories, setCategories] = useState<SubCategory[]>([]);

  const handleToggle = () => {
    setIsActive((prev) => !prev);
  };

  const getAllProjects = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/sub-categories?depth=0&limit=0`,
    );

    const result: SubCategories = await response.json();

    setCategories(result.docs);
  };

  useEffect(() => {
    getAllProjects();
  }, []);

  useEffect(() => {
    gsap
      .timeline()
      .to(filterBlurBgRef.current, { autoAlpha: isActive ? 1 : 0 });
  }, [isActive]);

  const toggleSubCate = (sub: SubCategory) => {
    const index = store.subActiveCate.findIndex((s) => s.id === sub.id);

    if (index === -1) {
      store.subActiveCate.push({ id: sub.id, title: sub.title.toLowerCase() });
    } else {
      store.subActiveCate.splice(index, 1);
    }
  };

  return (
    <div className="filter-menu pointer-events-none fixed inset-0 z-45 flex w-full flex-col mix-blend-difference">
      <div className="flex items-center justify-end p-5 2xl:p-9">
        <button
          onClick={handleToggle}
          className="pointer-events-auto flex h-7 cursor-pointer items-center gap-2 text-xs leading-[100%] text-white uppercase mix-blend-difference lg:text-base"
        >
          <span className="leading-none">filter</span>
          <span className="flex size-4 flex-col justify-around md:size-5">
            <span className="block h-0.5 w-4 rounded bg-white md:w-5" />
            <span className="block h-0.5 w-4 rounded bg-white md:w-5" />
            <span className="block h-0.5 w-4 rounded bg-white md:w-5" />
          </span>
        </button>
      </div>
      <div
        data-active={isActive}
        className="pointer-events-none flex flex-wrap items-center justify-center gap-6 p-5 opacity-0 transition-opacity duration-500 data-[active='true']:pointer-events-auto data-[active='true']:opacity-100 2xl:p-9"
      >
        {categories.map((elem, index) => {
          const selected = subActiveCate.some((s) => s.id === elem.id);

          return (
            <button
              key={index}
              data-selected={selected}
              onClick={() => toggleSubCate(elem)}
              className="cursor-pointer text-xs leading-[100%] text-white uppercase opacity-60 mix-blend-difference transition-opacity duration-200 data-[selected='true']:underline data-[selected='true']:opacity-100 lg:text-base"
            >
              {elem.title}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Filter;
