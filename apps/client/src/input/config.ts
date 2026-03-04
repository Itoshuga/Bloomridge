import type { InputConfig, KeyCode, VectorBindings } from "./types";

const defaultActionBindings = {
  // Add new digital actions here and assign their key codes.
  moveUp: ["KeyZ", "ArrowUp"],
  moveDown: ["KeyS", "ArrowDown"],
  moveLeft: ["KeyQ", "ArrowLeft"],
  moveRight: ["KeyD", "ArrowRight"]
} as const satisfies Record<string, readonly KeyCode[]>;

export type ActionName = keyof typeof defaultActionBindings;

export const actionBindings = defaultActionBindings;

const defaultVectorBindings = {
  move: {
    negativeX: "moveLeft",
    positiveX: "moveRight",
    negativeY: "moveUp",
    positiveY: "moveDown"
  }
} as const satisfies VectorBindings<ActionName, "move">;

export type VectorName = keyof typeof defaultVectorBindings;

export const vectorBindings = defaultVectorBindings;

export const inputConfig = {
  actions: actionBindings,
  vectors: vectorBindings
} as const satisfies InputConfig<ActionName, VectorName>;
