import "@testing-library/jest-dom";
import { vi } from "vitest";

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver;

HTMLMediaElement.prototype.play = vi.fn();
HTMLMediaElement.prototype.pause = vi.fn();
