import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

import { useAuthStore } from "../store/authStore";

export const startAuthListener = () => {
  return onAuthStateChanged(
    auth,
    async (user) => {
      const {
        setUser,
        setProfile,
        setLoading,
      } = useAuthStore.getState();

      if (!user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(user);

      try {
        const userRef = doc(
          db,
          "users",
          user.uid
        );

        const snapshot =
          await getDoc(userRef);

        if (snapshot.exists()) {
          setProfile({
            id: snapshot.id,
            ...snapshot.data(),
          });
        } else {
          // No profile found
          setProfile(null);
        }
      } catch (error) {
        console.error(
          "Failed to load user profile:",
          error
        );

        setProfile(null);
      }
    }
  );
};