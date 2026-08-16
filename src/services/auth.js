import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "./firebase";

import { useAuthStore } from "../store/authStore";

const ADMIN_EMAIL =
  "admin@nepaalking.com";

const MANAGER_EMAIL =
  "manager@nepaalking.com";


export const getUserRole = (email) => {
  if (
    email?.toLowerCase() ===
    ADMIN_EMAIL.toLowerCase()
  ) {
    return "admin";
  }

  if (
    email?.toLowerCase() ===
    MANAGER_EMAIL.toLowerCase()
  ) {
    return "manager";
  }

  return null;
};


export const login = async (
  email,
  password
) => {

  const result =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  const role =
    getUserRole(result.user.email);

  if (!role) {
    await signOut(auth);

    throw new Error(
      "This account is not authorized."
    );
  }

  useAuthStore
    .getState()
    .setAuth(
      result.user,
      role
    );

  return result.user;
};


export const logout = async () => {
  await signOut(auth);

  useAuthStore
    .getState()
    .logout();
};


export const startAuthListener = () => {

  return onAuthStateChanged(
    auth,
    (user) => {

      if (!user) {
        useAuthStore
          .getState()
          .setAuth(null, null);

        return;
      }

      const role =
        getUserRole(
          user.email
        );

      useAuthStore
        .getState()
        .setAuth(
          user,
          role
        );
    }
  );
};