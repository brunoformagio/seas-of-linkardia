import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { RenderShip } from "./RenderShip";
import { Ship } from "./ShipArea";
import Image from "next/image";
import { Icon } from "./Icons";
import { PlayerAccount } from "@/lib/contracts";

// This modal is a little animation that shows the battle between two ships. After 10 seconds, it closes.

export const BattleScene = ({ship1, ship2, dmgShip1, dmgShip2, onClose, isOpen}: {ship1: Ship, ship2: Ship, dmgShip1: number, dmgShip2: number, onClose: () => void, isOpen: boolean}) => {
    const [ship1Damage, setShip1Damage] = useState<number | null>(null);
    const [ship2Damage, setShip2Damage] = useState<number | null>(null);

    const RenderDamage = (damage: number | null) => {
        if (damage === null) return null;
        
        return <><div className="text-red-500 absolute damage-animation top-0 left-[50%] translate-x-[-50%] text-shadow-full-outline">
            -{damage}
        </div>
        <Image src="/fx/explosion.gif" className="absolute bottom-0 left-[50%] z-10 translate-x-[-50%] " alt="damage" width={256} height={256} />

        </>
    }

    useEffect(() => {
        const interval1 = setTimeout(() => {
            setShip1Damage(dmgShip1);
        }, 5000);

        return () => clearInterval(interval1);
    }, [ship1Damage]);

    useEffect(() => {
        const interval2 = setTimeout(() => {
            setShip2Damage(dmgShip2);
        }, 2000);
        return () => clearInterval(interval2);
    }, [ship2Damage]);

    useEffect(() => {
        const timeout1 = setTimeout(() => {
            onClose();
        }, 10000);
        //close after 10 seconds
        return () => {
            clearTimeout(timeout1);
        }
    }, []);
    
  return (
    <Modal title="Battle" open={isOpen} setOpen={onClose}>
      <div className="bg-white w-full  bg-[url('/sky.gif')] bg-[length:auto_780px] bg-center  relative h-[400px] overflow-hidden border-3 border-black">
      <div className="absolute ui2 flex items-center justify-center gap-6 p-5 text-2xl text-center w-[90%] top-[24px] left-[50%] translate-x-[-50%]">
        {ship1.name || "Unnamed Boat"} <Icon iconName="swords" /> {ship2.name || "Unnamed Boat"}
      </div>
        <div className="w-screen h-[256px] absolute bottom-5 left-0 flex flex-col items-center justify-center  bg-[url('/ocean_l2.gif')] opacity-50 scale-x-[-100%] bg-[length:512px_256px] bg-bottom bg-repeat-x" />
        <div className="grid grid-cols-2 gap-4 align-bottom">
          <div className="absolute bottom-10 left-0">
            {RenderDamage(ship1Damage)}
            <RenderShip ship={ship1} />
          </div>
          <div className="absolute bottom-10 right-0 transform ">
          {RenderDamage(ship2Damage)}
            <div className="scale-x-[-1]"><RenderShip ship={ship2} /></div>
          </div>
        </div>
        <div className="w-screen h-[64px]  absolute bottom-0 left-0 flex flex-col items-center justify-center  bg-[url('/ocean_l1.gif')] bg-[length:512px_64px] bg-top bg-repeat-x" />
      </div>
    </Modal>
  );
};
