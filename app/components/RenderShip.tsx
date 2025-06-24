import Image from "next/image";
import { Ship } from "./ShipArea";

export const RenderShip = ({
  ship,
  className,
}: {
  ship: Ship; //TODO: Change to correct type
  className?: string;
}) => {
  const level = ship.level;

  const ConvertShipFromLevel = (level: number) => {
    // 5 or less is 0
    if (level <= 5) {
      return 0;
    }
    // 6 or more is 1
    if (level >= 6) {
      return 1;
    }
    return 0;
  };


  return (
    <div className={`w-full ${className ? className : ""}  max-w-full flex relative flex-col items-center justify-start`}>
      <Image
        src={`/ships/${ConvertShipFromLevel(level)}-${ship.hp ? ship.hp < (ship.maxHp ?? 0) * 0.5 ? "damaged" : ship.hp < 1 ? "wrecked" : "healed" : "wrecked"}-${ship.isPirate ? "pirate" : "navy"}.gif`}
        alt="ship"
        width={256}
        height={256}
        className={`min-h-[256px] min-w-[256px] h-[256px] w-[256px] flex flex-col items-center justify-center  bg-[url('/ships/${ship}.gif')] bg-no-repeat bg-[length:256px_256px] bg-bottom floating-animation`}
      />
    </div>
  );
};
