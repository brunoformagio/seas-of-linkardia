import React, { useState } from "react";
import { RenderShip } from "./RenderShip";
import { useGameContract } from "../libs/hooks/useGameContract";
import { useThirdweb } from "../libs/hooks/useThirdweb";
export const ShipArea = () => {
    //TODO: Get ships from the location of the contract and set the correct type into state
    const [ships, setShips] = useState<any[]>([]);

    
  return (
    <div 
    className={`grid px-10 w-screen bottom-[40px] content-start absolute  `}
    style={{gridTemplateColumns: `repeat(${ships.length}, minmax(0, 1fr))`}}
    >
      {ships.map((ship, index) => (
        <RenderShip key={index} ship={index} />
      ))}
      </div>
  );
};