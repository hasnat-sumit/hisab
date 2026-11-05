import Image from "next/image";

import hisabLogo from "../../public/hisab-logo.png";

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
      <Image
        src={hisabLogo}
        alt=""
        width={45}
        height={40}
        className=""
      />
      হিসাব-Hisab
    </span>
  );
}
