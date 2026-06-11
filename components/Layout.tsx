import Header from "./Header";

import { Instrument_Serif } from "next/font/google";
import Info from "./Info";
import { useState } from "react";
import localFont from "next/font/local";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--google-font-instrument-serif",
});

const libreBaskerVille = localFont({
  src: "./fonts/LibreBaskervilleVariableFont.ttf",
  variable: "--local-font-libre-basker-ville",
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [activeInfo, setActiveInfo] = useState<boolean>(false);

  return (
    <main
      className={`${instrumentSerif.variable} ${libreBaskerVille.variable}`}
    >
      <Header setActiveInfo={setActiveInfo} />
      <Info activeInfo={activeInfo} setActiveInfo={setActiveInfo} />
      {children}
    </main>
  );
};

export default Layout;
