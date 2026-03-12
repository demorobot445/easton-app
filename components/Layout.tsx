import Header from "./Header";

import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--google-font-instrument-serif",
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className={`${instrumentSerif.variable}`}>
      <Header />
      {children}
    </main>
  );
};

export default Layout;
