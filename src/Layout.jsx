import { Outlet } from "react-router-dom";

import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

import "./layout.css";

export default function Layout() {
  return (
    <div className="app-layout">

      <Header />

      <main className="app-content">
        <Outlet />
      </main>

      <BottomNav />

    </div>
  );
}