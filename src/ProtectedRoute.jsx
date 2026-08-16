import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuthStore,
} from "./store/authStore";


export default function ProtectedRoute({
  roles = [],
}) {

  const {
    user,
    role,
    loading,
  } = useAuthStore();


  if (loading) {
    return (
      <div className="app-loading">
        Loading...
      </div>
    );
  }


  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (
    roles.length > 0 &&
    !roles.includes(role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  return <Outlet />;
}