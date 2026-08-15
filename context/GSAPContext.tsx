// only use for make React Ref global

import { createContext, useContext, useRef } from "react";

type GSAPContextType = {
  filterTl: React.RefObject<GSAPTimeline | null>;
};

const GSAPContext = createContext<GSAPContextType | null>(null);

export function GSAPProvider({ children }: { children: React.ReactNode }) {
  const filterTl = useRef<GSAPTimeline | null>(null);

  return (
    <GSAPContext.Provider value={{ filterTl }}>{children}</GSAPContext.Provider>
  );
}

export function useGSAPContext() {
  const context = useContext(GSAPContext);

  if (!context) {
    throw new Error("useGSAPContext must be used inside GSAPProvider");
  }

  return context;
}
