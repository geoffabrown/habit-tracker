// src/__tests__/auth.test.js
import { login } from "../utils/auth";

const testEmail = process.env.REACT_APP_TEST_EMAIL;
const testPassword = process.env.REACT_APP_TEST_PASSWORD;

it("logs in with valid credentials", async () => {
    const result = await login(testEmail, testPassword);
    expect(result).toBeTruthy();
});


it("fails login with wrong password", async () => {
    await expect(login("geoffabrown@gmail.com", "wrongpass")).rejects.toThrow();
});
