import Layout from "@/components/Layout";
import "@/styles/globals.css";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { AppProps } from "next/app";

gsap.registerPlugin(useGSAP);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
