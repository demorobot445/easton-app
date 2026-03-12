import { store } from "@/store";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="fixed inset-0 z-30 flex h-fit w-full justify-between p-5">
      <Image
        className="h-9 w-74 object-contain"
        src="/logo.png"
        alt="logo"
        height={100}
        width={400}
      />
      <div className="flex items-center gap-2 text-[.625rem] font-medium text-white uppercase [&>button]:cursor-pointer">
        <button onClick={() => (store.activeCate = "LEBRITY")}>LEBRITY</button>
        <button onClick={() => (store.activeCate = "EDITORIAL")}>
          EDITORIAL
        </button>
        <button onClick={() => (store.activeCate = "CAMPAIGN ")}>
          CAMPAIGN
        </button>
        <button onClick={() => (store.activeCate = "BEAUTY ")}>BEAUTY </button>
        <button onClick={() => (store.activeCate = "MUSIC")}>MUSIC</button>
        <button onClick={() => (store.activeCate = "COMMERCIAL")}>
          COMMERCIAL
        </button>
        <button onClick={() => (store.activeCate = "MOVING")}>MOVING</button>
        <button onClick={() => (store.activeCate = "PERSONAL")}>
          PERSONAL
        </button>

        <Link className="ml-6" href="/">
          PRINTS
        </Link>
        <Link href="/">CONTACT </Link>
      </div>
    </header>
  );
};

export default Header;
