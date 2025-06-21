import Image from "next/image";

const NamePlate = ({boatName}: {boatName: string}) => {
  return (
    <div className="absolute text-white top-[-50px] left-[-50px] bg-[url('/parchment.webp')] capitalize text-shadow-full-outline !text-2xl flex items-center justify-center bg-no-repeat bg-[length:auto_90px] bg-center w-[384px] h-[90px]">
      {boatName || "Unnamed boat"}
    </div>
  );
};

const AffiliationFlag = ({affiliation, className}: {affiliation: "pirates" | "navy", className?: string}) => {
    return (
       <Image unoptimized src={`/flags/${affiliation}_flag.webp`} alt={affiliation} width={32} height={32} className={className} />
    );
  };

const UserBoatPanelContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex p-7 flex-col bottom-[10px] left-[10px] w-[calc(100dvw-20px)] items-center justify-center  ui1 fixed h-[300px]">
      <div className="flex pt-[60px] pl-[10px] flex-col items-center justify-center w-full h-full relative">
        {children}
      </div>
    </div>
  );
};

export default function UserBoatPanel() {
  return (
    <UserBoatPanelContainer>
      <NamePlate boatName="The Black Pearl" />
      <AffiliationFlag affiliation="pirates" className="absolute top-[-50px] left-[290px] w-[90px] h-[90px]" />
      <div className="flex flex-row w-full h-full">
      <div className="flex flex-col w-full ui2 items-center justify-center  p-6 h-full gap-2 text-white">
        <div className="flex flex-col [&_*]:!text-xl justify-start w-full h-full">
        <div>HP: <span className="text-red-500">100/100</span></div>
        <div>Level: <span className="text-red-500">4</span></div>
        <div>Attack: <span className="text-red-500">1</span></div>
        <div>Defense: <span className="text-blue-500">2</span></div>
        <div>Speed: <span className="text-green-500">3</span></div>
        <div>Crew: <span className="text-green-500">32</span></div>
        </div>
      </div>
      <div className="flex flex-col w-full ui2 items-center justify-center  p-6 h-full gap-2 text-white">
        a</div>
        </div>
    </UserBoatPanelContainer>
  );
}
