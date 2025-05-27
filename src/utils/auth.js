import { auth } from "../firebase/config";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export const login = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result;
    } catch (err) {
        if (err.code === 'auth/user-not-found') {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            return result;
        } else {
            throw err;
        }
    }
};
