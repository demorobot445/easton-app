import Layout from "@/components/Layout";
import "@/styles/globals.css";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import SplitText from "gsap/dist/SplitText";
import type { AppProps } from "next/app";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
