import { store } from "@/store";
import { Project, Projects } from "@/types/payload-types";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";

const Filter = () => {
  const { activeCate, subActiveCate } = useSnapshot(store);
  const [isActive, setIsActive] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const handleToggle = () => {
    setIsActive((prev) => !prev);
  };

  const getAllProjects = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/projects?depth=0&limit=0`,
    );

    const result: Projects = await response.json();

    setProjects(result.docs);
  };

  useEffect(() => {
    getAllProjects();
  }, []);

  useEffect(() => {
    const uniqueSubCates = [
      ...new Set(
        projects
          .filter((project) => project.cate === activeCate)
          .map((project) => project.subCate)
          .filter(Boolean),
      ),
    ];

    setCategories(uniqueSubCates);
  }, [activeCate]);

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
          return (
            <button
              key={index}
              onClick={() => {
                if (subActiveCate === elem.toLocaleLowerCase()) {
                  store.subActiveCate = undefined;
                } else {
                  store.subActiveCate = elem.toLowerCase();
                }
              }}
              className="cursor-pointer text-xs leading-[100%] text-white uppercase mix-blend-difference lg:text-base"
            >
              {elem}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Filter;
