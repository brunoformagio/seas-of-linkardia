"use client";
import UserBoatPanel from "./components/UserBoatPanel";
import { Header } from "./components/Header";
import { RenderGameArea } from "./components/RenderGameArea";
import { MainContainer } from "./components/MainContainer";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ShipArea } from "./components/ShipArea";
import { RankingSection } from "./components/RankingSection";

export default function Home() {
  return (
    <MainContainer>
      <Header />
      <RenderGameArea>
        <ShipArea />
      </RenderGameArea>
      <UserBoatPanel />
      <RankingSection />
      <WelcomeScreen />
    </MainContainer>
  );
}
