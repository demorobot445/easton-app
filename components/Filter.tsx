import { store } from "@/store";
import { SubCategories, SubCategory } from "@/types/payload-types";
import { gsap } from "gsap";
import { useRouter } from "next/router";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useSnapshot } from "valtio";

interface Props {
  filterBlurBgRef: RefObject<HTMLDivElement | null>;
  setIsFilterActive: Dispatch<SetStateAction<boolean>>;
  isFilterActive: boolean;
}

const Filter: React.FC<Props> = ({
  filterBlurBgRef,
  setIsFilterActive,
  isFilterActive,
}) => {
  const { asPath } = useRouter();
  const { subActiveCate } = useSnapshot(store);
  const [categories, setCategories] = useState<SubCategory[]>([]);

  const handleToggle = () => {
    setIsFilterActive((prev) => !prev);
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
    if (!filterBlurBgRef.current) return;

    gsap.to(filterBlurBgRef.current, { autoAlpha: isFilterActive ? 1 : 0 });
  }, [isFilterActive, filterBlurBgRef]);

  // const toggleSubCate = (sub: SubCategory) => {
  //   setIsFilterActive(false);

  //   const index = store.subActiveCate.findIndex((s) => s.id === sub.id);

  //   if (index === -1) {
  //     store.subActiveCate.push({ id: sub.id, title: sub.title.toLowerCase() });
  //   } else {
  //     store.subActiveCate.splice(index, 1);
  //   }
  // };

  const toggleSubCate = (sub: SubCategory) => {
    setIsFilterActive(false);

    const isAlreadySelected = store.subActiveCate.some((s) => s.id === sub.id);

    // Clear any existing selection (single-select)
    store.subActiveCate.splice(0, store.subActiveCate.length);

    // If it wasn't the selected one, select it. Otherwise it stays cleared (deselect).
    if (!isAlreadySelected) {
      store.subActiveCate.push({ id: sub.id, title: sub.title.toLowerCase() });
    }
  };

  return (
    <>
      {/* Layer 1: blended layer, only the filter button */}
      <div className="filter-menu pointer-events-none fixed top-0 right-0 z-45 p-5 mix-blend-difference 2xl:p-9">
        <button
          onClick={handleToggle}
          className="pointer-events-auto flex h-7 cursor-pointer items-center gap-2 text-xs leading-[100%] text-white uppercase lg:text-base"
        >
          <span className="leading-none">filter</span>
          <span className="flex size-4 flex-col justify-around md:size-5">
            <span className="block h-0.5 w-4 rounded bg-white md:w-5" />
            <span className="block h-0.5 w-4 rounded bg-white md:w-5" />
            <span className="block h-0.5 w-4 rounded bg-white md:w-5" />
          </span>
        </button>
      </div>

      {/* Layer 2: normal layer, categories stay plain white */}
      <div
        data-text-white={asPath === "/"}
        data-active={isFilterActive}
        className="pointer-events-none fixed inset-x-0 top-12 z-45 flex flex-wrap items-center justify-center gap-6 p-5 opacity-0 transition-opacity duration-500 data-[active='true']:pointer-events-auto data-[active='true']:opacity-100 data-[text-white='true']:text-white 2xl:top-16 2xl:p-9"
      >
        {categories.map((elem) => {
          const selected = subActiveCate.some((s) => s.id === elem.id);

          return (
            <button
              key={elem.id}
              data-selected={selected}
              onClick={() => toggleSubCate(elem)}
              className="cursor-pointer text-xs leading-[100%] uppercase opacity-100 transition-opacity duration-200 data-[selected='true']:underline lg:text-base"
            >
              {elem.title}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default Filter;
