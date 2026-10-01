import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MusicPlayer from "../components/MusicPlayer";
import Queue from "../components/Queue";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="h-screen flex bg-black text-white">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <MusicPlayer />

      </div>

      <Queue />

    </div>
  );
}