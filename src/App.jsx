import { Routes, Route } from "react-router-dom";

import POSPage from "./pages/POSPage";
import OrdersPage from "./pages/OrdersPage";
import InventoryPage from "./pages/InventoryPage";
import ProfilePage from "./pages/ProfilePage";
import Layout from "./Layout";
import DailyStockPage from "./pages/DailyStockPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<POSPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/stock" element={<DailyStockPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}