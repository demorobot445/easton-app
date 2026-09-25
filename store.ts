import { proxy } from "valtio";
import { SubCategory } from "./types/payload-types";

type Store = {
  activeCate: "all" | "creative" | "commercial";
  subActiveCate: SubCategory[];
  selectorIsActive: boolean;
  isMenuActive: boolean;
};

export const store = proxy<Store>({
  activeCate: "all",
  subActiveCate: [],
  selectorIsActive: true,
  isMenuActive: false,
});
