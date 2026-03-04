import type { Vector2 } from "./types";

export function normalizeVector2(vector: Vector2): Vector2 {
  const length = Math.hypot(vector.x, vector.y);

  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: vector.x / length,
    y: vector.y / length
  };
}
