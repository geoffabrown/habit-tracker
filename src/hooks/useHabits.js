// src/hooks/useHabits.js
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

export function useHabits(userId) {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const habitsRef = collection(db, "users", userId, "habits");

    const unsubscribe = onSnapshot(habitsRef, (snapshot) => {
      const loaded = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
        console.log("Raw Firestore habit docs:", snapshot.docs.map(doc => doc.data()));
        //        console.log("onSnapshot data:", loaded); // ← ADD THIS
      setHabits(loaded);
    });

    return unsubscribe;
  }, [userId]);

    const toggleDay = async (habitId, dateKey) => {
        const docRef = doc(db, "users", userId, "habits", habitId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return;

        const current = docSnap.data();
        const days = current.days || {};
        const currentValue = days[dateKey] || false;

        days[dateKey] = !currentValue;

        await setDoc(docRef, { days }, { merge: true });

        console.log(`Updated Firestore: days.${dateKey} = ${!currentValue}`);
    };



  const createHabit = async (title) => {
    const newRef = doc(collection(db, "users", userId, "habits"));
    await setDoc(newRef, {
      title,
      days: {},
    });
  };

  return { habits, toggleDay, createHabit };
}
