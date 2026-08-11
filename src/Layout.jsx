import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

export default function Layout() {
  return (
    <>
      <Header />

      <main className="main-content">
        <Outlet />
      </main>

      <BottomNav />
    </>
  );
}