import { describe, it, expect } from "vitest";

describe("App", () => {
  it("should pass a basic test", () => {
    expect(true).toBe(true);
  });

  it("should add numbers correctly", () => {
    expect(2 + 2).toBe(4);
  });
});