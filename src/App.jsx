import { useEffect } from "react";
import {
  Routes,
  Route,
} from "react-router-dom";

import {
  startAuthListener,
} from "./services/auth";

import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";

import POSPage from "./pages/POSPage";
import OrdersPage from "./pages/OrdersPage";
import InventoryPage from "./pages/InventoryPage";
import DailyStockPage from "./pages/DailyStockPage";
import DashboardPage from "./pages/DashboardPage";

import Layout from "./Layout";


export default function App() {

  useEffect(() => {
    const unsubscribe =
      startAuthListener();

    return unsubscribe;
  }, []);


  return (
    <Routes>

      {/* =========================
          LOGIN
      ========================= */}

      <Route
        path="/login"
        element={<LoginPage />}
      />


      {/* =========================
          PROTECTED APPLICATION
      ========================= */}

      <Route
        element={
          <ProtectedRoute
            roles={[
              "admin",
              "manager",
            ]}
          />
        }
      >

        {/* =========================
            APPLICATION LAYOUT
        ========================= */}

        <Route element={<Layout />}>

          {/* POS */}

          <Route
            path="/"
            element={<POSPage />}
          />


          {/* ORDERS */}

          <Route
            path="/orders"
            element={<OrdersPage />}
          />


          {/* INVENTORY */}

          <Route
            path="/inventory"
            element={<InventoryPage />}
          />


          {/* EXPENSES */}

          <Route
            path="/stock"
            element={<DailyStockPage />}
          />


          {/* DASHBOARD */}

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

        </Route>

      </Route>

    </Routes>
  );
}