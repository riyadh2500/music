import React from "react";
import { Header, Sidebar, Player, Footer } from "../components";
import Notifications from "../components/Notifications/Notifications";

const NotificationsPage = ({ user, onLoginWithEmail, onRegisterWithEmail, onLogout }) => {
  return (
    <>
      <Sidebar />
      <Header
        user={user}
        onLoginWithEmail={onLoginWithEmail}
        onRegisterWithEmail={onRegisterWithEmail}
        onLogout={onLogout}
      />
      <main style={{
        marginLeft: 240, marginTop: 64, marginBottom: 72,
        padding: "28px 32px",
        minHeight: "calc(100vh - 64px - 72px)",
        background: "#fafafa",
      }}>
        <Notifications user={user} />
        <Footer />
      </main>
      <Player />
    </>
  );
};

export default NotificationsPage;
