import { proxy } from "valtio";

type Store = {
  activeCate: "all" | "creative" | "commerical";
  selectorIsActive: boolean;
};

export const store = proxy<Store>({
  activeCate: "all",
  selectorIsActive: true,
});
