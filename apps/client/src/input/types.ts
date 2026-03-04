export type KeyCode = KeyboardEvent["code"];

export type DigitalValue = 0 | 1;

export type Vector2 = Readonly<{
  x: number;
  y: number;
}>;

export type Bindings<TAction extends string> = Readonly<
  Record<TAction, readonly KeyCode[]>
>;

export type Vector2Composite<TAction extends string> = Readonly<{
  negativeX: TAction;
  positiveX: TAction;
  negativeY: TAction;
  positiveY: TAction;
}>;

export type VectorBindings<TAction extends string, TVector extends string> =
  Readonly<Record<TVector, Vector2Composite<TAction>>>;

export type InputConfig<TAction extends string, TVector extends string> =
  Readonly<{
    actions: Bindings<TAction>;
    vectors: VectorBindings<TAction, TVector>;
  }>;
