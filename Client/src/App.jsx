import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import CreatePlaylist from "./pages/CreatePlaylist";
import Playlists from "./pages/Playlists";
import PlaylistDetails from "./pages/PlaylistDetails";
import Library from "./pages/Library";
import Login from "./pages/Login";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import Register from "./pages/Register";
import { useState } from "react";
import SplashScreen from "./components/SplashScreen";

function App() {
   const [loading, setLoading] = useState(true);

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/create-playlist" element={<CreatePlaylist />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/:playlistId" element={<PlaylistDetails />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
