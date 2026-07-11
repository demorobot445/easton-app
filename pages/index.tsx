import Head from "next/head";
import Selector from "@/components/Selector";
import ShaderGallery from "@/components/ShaderGallery/ShaderGallery";
import { Project, Projects } from "@/types/payload-types";
import { GetStaticProps, InferGetStaticPropsType } from "next";

export const getStaticProps = (async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/projects?depth=2`,
  );
  const result: Projects = await response.json();

  return {
    props: {
      data: result.docs,
    },
    revalidate: 60,
  };
}) satisfies GetStaticProps<{
  data: Project[];
}>;

export default function Home({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Head>
        <title>Easton Schirra</title>
      </Head>
      <Selector />
      <div className="fixed inset-0 z-10 flex h-full w-full items-center justify-center bg-black">
        <ShaderGallery projects={data} />
      </div>
    </>
  );
}
