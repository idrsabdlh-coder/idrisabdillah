import Image from "next/image";
import { DesktopProvider } from "@/context/DesktopContext";
import TopBar from "@/components/TopBar";
import Dock from "@/components/Dock";
import DesktopIcons from "@/components/DesktopIcons";
import MobileHome from "@/components/MobileHome";
import AboutWindow from "@/components/windows/AboutWindow";
import ResumeWindow from "@/components/windows/ResumeWindow";
import ProjectsWindow from "@/components/windows/ProjectsWindow";
import MusicWindow from "@/components/windows/MusicWindow";
import GameWindow from "@/components/windows/GameWindow";

export default function Home() {
  return (
    <DesktopProvider>
      <main className="relative min-h-screen overflow-hidden bg-black">
        <Image
          src="/images/wallpaper2.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />

        <TopBar />
        <Dock />
        <DesktopIcons />
        <MobileHome />

        <AboutWindow />
        <ResumeWindow />
        <ProjectsWindow />
        <MusicWindow />
        <GameWindow />
      </main>
    </DesktopProvider>
  );
}