import { TravelCountdown } from "./TravelCountdown"
import { usePlayer } from "../libs/providers/player-provider"
import Button from "./Button"

export const ShipActionsSection = ({showTravelModal, setShowTravelModal, handleTravelComplete}: {showTravelModal: boolean, setShowTravelModal: (show: boolean) => void, handleTravelComplete: () => void}) => {
    const { playerAccount, isTraveling, isWrecked, maxHp } = usePlayer();
    return (
        <section className="flex flex-col w-full ui2 items-center justify-center p-6 h-full gap-2 text-white">
              {isTraveling ? (
                <>
                  <div className="text-white !text-xl mb-4">
                    En Route to Destination
                  </div>
                  <TravelCountdown
                    travelEndTime={playerAccount?.travelEnd || 0}
                    onTravelComplete={handleTravelComplete}
                  />
                </>
              ) : (
                <>
                  <div className="text-white !text-xl">
                    Coordinate {playerAccount?.location} - Actions:
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowTravelModal(true)}
                      disabled={isWrecked}
                    >
                      Travel to...
                    </Button>
                    <Button
                      onClick={() => {}}
                      disabled={(playerAccount?.hp || 0) >= maxHp}
                    >
                      {(playerAccount?.hp || 0) >= maxHp ? "Full HP" : "Repair"}
                    </Button>
                  </div>
                </>
              )}
            </section>
    )
}