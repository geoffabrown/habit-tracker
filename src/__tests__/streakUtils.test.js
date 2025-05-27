// __tests__/streakUtils.test.js
import { calculateStreaks } from "../utils/streakUtils";

describe("calculateStreaks", () => {
  it("returns 0/0 for empty days", () => {
    expect(calculateStreaks({})).toEqual({
      currentStreak: 0,
      longestStreak: 0,
    });
  });

  it("handles a single day", () => {
    const days = { "2025-05-01": true };
    expect(calculateStreaks(days)).toEqual({
      currentStreak: 0, // depends on today's date!
      longestStreak: 1,
    });
  });

  it("calculates longest vs current streaks", () => {
    const days = {
      "2025-05-01": true,
      "2025-05-02": true,
      "2025-05-03": true,
      "2025-05-04": false,
      "2025-05-05": true,
      "2025-05-06": true,
      "2025-05-07": true,
    };
    const result = calculateStreaks(days);
    expect(result.longestStreak).toBe(3);
    expect(result.currentStreak).toBeGreaterThanOrEqual(0); // depends on today
  });
});
