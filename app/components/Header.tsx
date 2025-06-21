import Image from "next/image";

export const Header = () => {
  return (
    <header className="flex items-center justify-between p-10 w-screen ">
      <h1>
        <Image
          unoptimized
          src="/logo.png"
          alt="Seas Of Linkardia"
          width={256}
          height={256}
        />
      </h1>
      <button className="bg-white text-black px-4 py-2 rounded-md">
        Connect Wallet
      </button>
    </header>
  );
};
