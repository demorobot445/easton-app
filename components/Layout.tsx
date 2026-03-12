import Header from "./Header";

import { Instrument_Serif } from "next/font/google";
import Info from "./Info";
import { useState } from "react";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--google-font-instrument-serif",
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [activeInfo, setActiveInfo] = useState<boolean>(false);

  return (
    <main className={`${instrumentSerif.variable}`}>
      <Header setActiveInfo={setActiveInfo} />
      <Info activeInfo={activeInfo} setActiveInfo={setActiveInfo} />
      {children}
    </main>
  );
};

export default Layout;
