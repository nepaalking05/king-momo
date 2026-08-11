import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

export async function saveOrder(order) {
  return await addDoc(
    collection(db, "orders"),
    {
      ...order,
      orderNo: Date.now(),
      createdAt: serverTimestamp(),
    }
  );
}