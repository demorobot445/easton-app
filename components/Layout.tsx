import Header from "./Header";
import Info from "./Info";
import { useState } from "react";
import localFont from "next/font/local";
import ContactOverlay from "./ContactOverlay";

const libreBaskerVille = localFont({
  src: "./fonts/LibreBaskervilleVariableFont.ttf",
  variable: "--local-font-libre-basker-ville",
});

export const neueHaasDisplay = localFont({
  variable: "--font-neue-haas-display",
  display: "swap",
  src: [
    {
      path: "./fonts/neuehaasgrotdisp-15xxthin-trial.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/neuehaasgrotdisp-16xxthinitalic-trial.otf",
      weight: "100",
      style: "italic",
    },
    {
      path: "./fonts/neuehaasgrotdisp-25xthin-trial.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/neuehaasgrotdisp-26xthinitalic-trial.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "./fonts/neuehaasgrotdisp-35thin-trial.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/neuehaasgrotdisp-36thinitalic-trial.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/neuehaasgrotdisp-45light-trial.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/neuehaasgrotdisp-46lightitalic-trial.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/neuehaasgrotdisp-55roman-trial.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/neuehaasgrotdisp-56italic-trial.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/neuehaasgrotdisp-65medium-trial.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/neuehaasgrotdisp-66mediumitalic-trial.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "./fonts/neuehaasgrotdisp-75bold-trial.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/neuehaasgrotdisp-76bolditalic-trial.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "./fonts/neuehaasgrotdisp-95black-trial.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/neuehaasgrotdisp-96blackitalic-trial.otf",
      weight: "900",
      style: "italic",
    },
  ],
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [activeInfo, setActiveInfo] = useState<boolean>(false);
  const [activeContact, setActiveContact] = useState<boolean>(false);

  return (
    <main
      className={`${neueHaasDisplay.variable} ${libreBaskerVille.variable} font-sans`}
    >
      <Header
        setActiveInfo={setActiveInfo}
        setActiveContact={setActiveContact}
      />
      <Info activeInfo={activeInfo} setActiveInfo={setActiveInfo} />
      <ContactOverlay
        activeInfo={activeContact}
        setActiveInfo={setActiveContact}
      />
      {children}
    </main>
  );
};

export default Layout;
