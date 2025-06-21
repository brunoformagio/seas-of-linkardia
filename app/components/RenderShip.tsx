import Image from "next/image";

export const RenderShip = ({
  ship,
  className,
}: {
  ship: number;
  className?: string;
}) => {
  return (
    <div className="w-full  max-w-full flex relative flex-col items-center justify-start">
      <Image
        src={`/ships/${ship}.gif`}
        alt="ship"
        width={256}
        height={256}
        className={`min-h-[256px] min-w-[256px] h-[256px] w-[256px] flex flex-col items-center justify-center  bg-[url('/ships/${ship}.gif')] bg-no-repeat bg-[length:256px_256px] bg-bottom floating-animation ${
          className ? className : ""
        }`}
      />
    </div>
  );
};
