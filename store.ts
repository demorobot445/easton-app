import { proxy } from "valtio";

type Store = {
  activeCate: "all" | "creative" | "commercial";
  subActiveCate: string | undefined;
  selectorIsActive: boolean;
  isMenuActive: boolean;
};

export const store = proxy<Store>({
  activeCate: "all",
  subActiveCate: undefined,
  selectorIsActive: true,
  isMenuActive: false,
});
