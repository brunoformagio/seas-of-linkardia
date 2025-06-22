import { useState } from "react";
    import { usePlayer } from "../libs/providers/player-provider";

export const ShipStatsSection = () => {
    const { playerAccount, isWrecked, maxHp } = usePlayer();

    return (
            <section className="flex flex-col  min-w-[300px] ui2 items-center justify-center p-6 h-full gap-2 text-white">
              <div className="flex flex-col [&_*]:!text-xl justify-start w-full h-full">
                <div>
                  HP:{" "}
                  <span
                    className={`${
                      isWrecked
                        ? "text-red-600"
                        : (playerAccount?.hp || 0) <= 25
                        ? "text-red-400"
                        : "text-red-500"
                    }`}
                  >
                    {playerAccount?.hp}/{maxHp}
                  </span>
                  {isWrecked && (
                    <span className="text-red-600 ml-2">WRECKED!</span>
                  )}
                </div>
                <div>
                                     {[25, 55, 89].includes(playerAccount?.location || 0) && (
                     <span className="text-blue-400 ml-2">⚓ PORT</span>
                   )}
                </div>
                <div>
                  Attack:{" "}
                  <span className="text-red-500">{playerAccount?.attack}</span>
                </div>
                <div>
                  Defense:{" "}
                  <span className="text-blue-500">{playerAccount?.defense}</span>
                </div>
                <div>
                  Speed:{" "}
                  <span className="text-green-500">{playerAccount?.speed}</span>
                </div>
                <div>
                  Crew:{" "}
                  <span >{playerAccount?.crew}/{playerAccount?.maxCrew}</span>
                </div>
                {playerAccount?.checkInStreak && playerAccount.checkInStreak > 0 ? (
                  <div>
                    Streak:{" "}
                    <span className="text-purple-400">
                      {playerAccount?.checkInStreak} days
                    </span>
                  </div>
                ) : null}
              </div>
            </section>
    )
}