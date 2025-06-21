"use client";
import UserBoatPanel from "./components/UserBoatPanel";
import { RenderShip } from "./components/RenderShip";
import { Header } from "./components/Header";
import { RenderGameArea } from "./components/RenderGameArea";
import { MainContainer } from "./components/MainContainer";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ShipArea } from "./components/ShipArea";

export default function Home() {
  return (
    <MainContainer>
      <Header />
      <RenderGameArea>
        <ShipArea/>
      </RenderGameArea>
      <UserBoatPanel />
              <WelcomeScreen />
    </MainContainer>
  );
}
