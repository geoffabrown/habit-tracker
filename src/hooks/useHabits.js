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
      setHabits(loaded);
    });

    return unsubscribe;
  }, [userId]);

  const toggleDay = async (habitId, dateKey, note = "") => {
    const docRef = doc(db, "users", userId, "habits", habitId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const current = docSnap.data();
    const days = current.days || {};
    const currentValue = days[dateKey] || { completed: false, note: "" };

    days[dateKey] = {
      completed: !currentValue.completed,
      note: note || currentValue.note || ""
    };

    await setDoc(docRef, { days }, { merge: true });
  };

  const updateNote = async (habitId, dateKey, note) => {
    const docRef = doc(db, "users", userId, "habits", habitId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const current = docSnap.data();
    const days = current.days || {};
    const currentValue = days[dateKey] || { completed: false, note: "" };

    days[dateKey] = {
      ...currentValue,
      note
    };

    await setDoc(docRef, { days }, { merge: true });
  };

  const createHabit = async (title) => {
    const newRef = doc(collection(db, "users", userId, "habits"));
    await setDoc(newRef, {
      title,
      days: {},
    });
  };

  return { habits, toggleDay, updateNote, createHabit };
}
