// src/__tests__/auth.test.js
import { login } from "../utils/auth";

it("logs in with valid credentials", async () => {
    const result = await login("geoffabrown@gmail.com", "pandapanda");
    expect(result.user.email).toBe("geoffabrown@gmail.com");
});

it("fails login with wrong password", async () => {
    await expect(login("geoffabrown@gmail.com", "wrongpass")).rejects.toThrow();
});
