import Image from "next/image";

export const RenderShip = ({
  ship,
  className,
}: {
  ship: any; //TODO: Change to correct type
  className?: string;
}) => {
  const level = ship.level;


  return (
    <div className={`w-full ${className ? className : ""}  max-w-full flex relative flex-col items-center justify-start`}>
      <Image
        src={`/ships/${level}.gif`}
        alt="ship"
        width={256}
        height={256}
        className={`min-h-[256px] min-w-[256px] h-[256px] w-[256px] flex flex-col items-center justify-center  bg-[url('/ships/${ship}.gif')] bg-no-repeat bg-[length:256px_256px] bg-bottom floating-animation`}
      />
    </div>
  );
};
