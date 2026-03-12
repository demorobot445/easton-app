import { proxy } from "valtio";

type Store = {
  activeCate:
    | "LEBRITY"
    | "EDITORIAL"
    | "CAMPAIGN "
    | "BEAUTY "
    | "MUSIC"
    | "COMMERCIAL"
    | "MOVING"
    | "PERSONAL"
    | "ALL";
};

export const store = proxy<Store>({
  activeCate: "ALL",
});
