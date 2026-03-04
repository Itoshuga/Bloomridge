import { normalizeVector2 } from "./math";
import type {
  Bindings,
  DigitalValue,
  InputConfig,
  KeyCode,
  Vector2,
  VectorBindings
} from "./types";

const SCROLL_BLOCKED_KEYS = new Set<KeyCode>([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight"
]);

export class InputActions<TAction extends string, TVector extends string> {
  private readonly pressedKeys = new Set<KeyCode>();
  private readonly trackedKeys = new Set<KeyCode>();
  private readonly preventDefaultKeys = new Set<KeyCode>();

  private actionBindings: Bindings<TAction>;
  private vectorBindings: VectorBindings<TAction, TVector>;
  private isAttached = false;

  public constructor(config: InputConfig<TAction, TVector>) {
    this.actionBindings = config.actions;
    this.vectorBindings = config.vectors;
    this.rebuildKeyMetadata();
  }

  public attach(): void {
    if (this.isAttached) {
      return;
    }

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("blur", this.handleBlur);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.isAttached = true;
  }

  public detach(): void {
    if (!this.isAttached) {
      return;
    }

    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("blur", this.handleBlur);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
    this.reset();
    this.isAttached = false;
  }

  public setActionBindings(bindings: Bindings<TAction>): void {
    this.actionBindings = bindings;
    this.rebuildKeyMetadata();
    this.reset();
  }

  public setVectorBindings(bindings: VectorBindings<TAction, TVector>): void {
    this.vectorBindings = bindings;
  }

  public reset(): void {
    this.pressedKeys.clear();
  }

  public getActionValue(actionName: TAction): DigitalValue {
    for (const keyCode of this.actionBindings[actionName]) {
      if (this.pressedKeys.has(keyCode)) {
        return 1;
      }
    }

    return 0;
  }

  public getVector2(vectorName: TVector): Vector2 {
    const binding = this.vectorBindings[vectorName];
    const x =
      this.getActionValue(binding.positiveX) -
      this.getActionValue(binding.negativeX);
    const y =
      this.getActionValue(binding.positiveY) -
      this.getActionValue(binding.negativeY);

    return normalizeVector2({ x, y });
  }

  private rebuildKeyMetadata(): void {
    this.trackedKeys.clear();
    this.preventDefaultKeys.clear();

    for (const actionName of Object.keys(this.actionBindings) as TAction[]) {
      for (const keyCode of this.actionBindings[actionName]) {
        this.trackedKeys.add(keyCode);

        if (SCROLL_BLOCKED_KEYS.has(keyCode)) {
          this.preventDefaultKeys.add(keyCode);
        }
      }
    }
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.trackedKeys.has(event.code)) {
      return;
    }

    this.maybePreventDefault(event);

    if (event.repeat) {
      return;
    }

    this.pressedKeys.add(event.code);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    if (!this.trackedKeys.has(event.code)) {
      return;
    }

    this.maybePreventDefault(event);
    this.pressedKeys.delete(event.code);
  };

  private readonly handleBlur = (): void => {
    this.reset();
  };

  private readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.reset();
    }
  };

  private maybePreventDefault(event: KeyboardEvent): void {
    if (this.preventDefaultKeys.has(event.code)) {
      event.preventDefault();
    }
  }
}
