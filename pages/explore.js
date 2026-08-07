import React from "react";
import MusicBackground from "../components/Global/MusicBackground";
import { Header, Sidebar, Player, Explore, Footer } from "../components";


const ExplorePage = ({ user, onLoginWithEmail, onRegisterWithEmail, onLogout }) => {

  return (
    <>
      <MusicBackground />
      <Sidebar />
      <Header user={user} onLoginWithEmail={onLoginWithEmail} onRegisterWithEmail={onRegisterWithEmail} onLogout={onLogout} />
      <main
        style={{
          marginLeft: 240,
          marginTop: 64,
          marginBottom: 72,
          padding: "28px 32px",
          minHeight: "calc(100vh - 64px - 72px)",
          background: "transparent",
          position: "relative", zIndex: 1,
        }}
      >
        <Explore user={user} />
        <Footer />
      </main>
      <Player />
    </>
  );
};

export default ExplorePage;
