import { inputConfig, type ActionName, type VectorName } from "./config";
import { InputActions } from "./InputActions";
import type { Bindings, Vector2, VectorBindings } from "./types";

export type ActionBindingsMap = Bindings<ActionName>;

export type NamedVectorBindings = VectorBindings<ActionName, VectorName>;

export class GameInput extends InputActions<ActionName, VectorName> {
  public constructor() {
    super(inputConfig);
  }

  public getMoveVector(): Vector2 {
    return this.getVector2("move");
  }
}

export function createGameInput(): GameInput {
  return new GameInput();
}
