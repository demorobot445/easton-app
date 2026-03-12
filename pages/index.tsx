import Head from "next/head";
import dynamic from "next/dynamic";

const Gallery = dynamic(() => import("../components/Gallery"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Easton Schirra</title>
      </Head>

      <div className="fixed inset-0 z-10 h-full w-full">
        <Gallery />
      </div>
    </>
  );
}
