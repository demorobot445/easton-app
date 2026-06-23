import { proxy } from "valtio";

type Store = {
  activeCate: "all" | "creative" | "commercial";
  selectorIsActive: boolean;
};

export const store = proxy<Store>({
  activeCate: "all",
  selectorIsActive: true,
});
