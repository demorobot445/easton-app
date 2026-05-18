import Head from "next/head";
import Selector from "@/components/Selector";
import ShaderGallery from "@/components/ShaderGallery/ShaderGallery";

export default function Home() {
  return (
    <>
      <Head>
        <title>Easton Schirra</title>
      </Head>
      <Selector />
      <div className="fixed inset-0 z-10 flex h-full w-full items-center justify-center">
        <ShaderGallery />
      </div>
    </>
  );
}
