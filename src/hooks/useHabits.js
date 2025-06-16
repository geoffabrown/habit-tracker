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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.log('No userId provided to useHabits');
      return;
    }

    console.log('Setting up habits listener for user:', userId);
    const habitsRef = collection(db, "users", userId, "habits");

    const unsubscribe = onSnapshot(habitsRef, 
      (snapshot) => {
        console.log('Received habits snapshot:', snapshot.docs.length, 'documents');
        const loaded = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('Processing habit:', doc.id, data);
          
          // Convert old format to new format
          const days = data.days || {};
          const convertedDays = Object.entries(days).reduce((acc, [key, value]) => {
            if (typeof value === 'boolean') {
              acc[key] = { completed: value, note: "" };
            } else if (typeof value === 'object' && value !== null) {
              acc[key] = {
                completed: typeof value.completed === 'boolean' ? value.completed : false,
                note: typeof value.note === 'string' ? value.note : ""
              };
            } else {
              acc[key] = { completed: false, note: "" };
            }
            return acc;
          }, {});
          
          return {
            id: doc.id,
            ...data,
            days: convertedDays
          };
        });
        console.log('Processed habits:', loaded);
        setHabits(loaded);
        setError(null);
      },
      (error) => {
        console.error('Error in habits listener:', error);
        setError(error.message);
      }
    );

    return () => {
      console.log('Cleaning up habits listener');
      unsubscribe();
    };
  }, [userId]);

  const toggleDay = async (habitId, dateKey, note = "") => {
    try {
      const docRef = doc(db, "users", userId, "habits", habitId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error('Habit document does not exist:', habitId);
        return;
      }

      const current = docSnap.data();
      const days = current.days || {};
      const currentValue = days[dateKey];
      
      // Handle both old and new formats
      const newValue = {
        completed: typeof currentValue === 'boolean' 
          ? !currentValue 
          : !(currentValue?.completed ?? false),
        note: note || (currentValue?.note ?? "")
      };

      days[dateKey] = newValue;
      await setDoc(docRef, { days }, { merge: true });
      console.log('Successfully toggled day:', { habitId, dateKey, newValue });
    } catch (error) {
      console.error('Error toggling day:', error);
      throw error;
    }
  };

  const updateNote = async (habitId, dateKey, note) => {
    try {
      const docRef = doc(db, "users", userId, "habits", habitId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error('Habit document does not exist:', habitId);
        return;
      }

      const current = docSnap.data();
      const days = current.days || {};
      const currentValue = days[dateKey];
      
      // Handle both old and new formats
      const newValue = {
        completed: typeof currentValue === 'boolean' 
          ? currentValue 
          : (currentValue?.completed ?? false),
        note
      };

      days[dateKey] = newValue;
      await setDoc(docRef, { days }, { merge: true });
      console.log('Successfully updated note:', { habitId, dateKey, newValue });
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const createHabit = async (title) => {
    try {
      const newRef = doc(collection(db, "users", userId, "habits"));
      await setDoc(newRef, {
        title,
        days: {},
        createdAt: new Date().toISOString()
      });
      console.log('Successfully created habit:', title);
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  };

  return { habits, error, toggleDay, updateNote, createHabit };
}
