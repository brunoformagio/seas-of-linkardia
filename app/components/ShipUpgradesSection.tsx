import Image from "next/image";
import Button from "./Button";

const UpgradeItem = ({upgrade}: {upgrade: number}) => {
    return (
        <div className="flex ui2  w-full gap-2 !brightness-120 p-4 items-center justify-between">
            <div className="flex items-center justify-center gap-2">
            <Image unoptimized  src={`/upgrades/${upgrade}.webp`} alt="Upgrade" width={48} height={48} />
            <div className="text-white !text-lg text-shadow-[0_2px_0px_#291414,0_1px_0px_#291414] flex flex-col items-center justify-center">
                <div className="text-white !text-lg">Upgrade Name</div>
                <div className="text-white !text-sm">Bonus: +10% Speed</div>
            </div>
            </div>
            <div className="flex items-center justify-center gap-2">
                <Button onClick={() => {}}>100 gold</Button>
            </div>
        </div>
    )
}

export const ShipUpgradesSection = () => {
    return (
        <section className="flex flex-col  w-full ui2 items-center justify-center  h-[200px] overflow-y-auto p-4 gap-2 text-white">
            <div className="text-white !text-xl w-full h-full ">
                <div className="flex flex-col w-full gap-2 max-h-full ">
                <UpgradeItem upgrade={0} />
                <UpgradeItem upgrade={0} />
                <UpgradeItem upgrade={0} />
                </div>
            </div>
        </section>
    )
}