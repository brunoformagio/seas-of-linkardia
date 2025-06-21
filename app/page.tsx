"use client";
import UserBoatPanel from "./components/UserBoatPanel";
import { RenderShip } from "./components/RenderShip";
import { Header } from "./components/Header";
import { RenderGameArea } from "./components/RenderGameArea";
import { MainContainer } from "./components/MainContainer";
import { WelcomeScreen } from "./components/WelcomeScreen";

export default function Home() {
  return (
    <MainContainer>
      <Header />
      <RenderGameArea>
      <RenderShip ship={0} />
      <RenderShip ship={0} />
      </RenderGameArea>
      <UserBoatPanel />
              <WelcomeScreen />
    </MainContainer>
  );
}
