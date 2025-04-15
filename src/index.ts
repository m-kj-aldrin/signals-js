/**
 * @module signals
 */

/** Function passed to effect, optionally returns a cleanup function. */
export type EffectCallback = () => void | (() => void);

/** Represents an effect's context for dependency tracking. */
export interface Context {
  notify: () => void;
  link: (signal: Signal<any>) => void; // Effects can depend on signals of any type
}

/**
 * Signal class: Holds state and notifies dependents on change.
 * @template T The type of the value held by the signal.
 */
export class Signal<T> {
  #value: T | undefined;
  #subscribers: Set<Context> = new Set();

  /**
   * Creates a new Signal instance.
   * @param initialValue Optional initial value for the signal.
   */
  constructor(initialValue?: T) {
    this.#value = initialValue;
  }

  /**
   * Sets the signal's value and notifies subscribers.
   * Ensures that subscribers are notified only once even if the value changes multiple times rapidly.
   * @param v The new value.
   */
  set value(v: T | undefined) {
    if (Object.is(this.peek(), v)) {
      return;
    }

    this.#value = v;

    if (is_batching) {
      this.#subscribers.forEach((context) => batch_contexts.add(context));
    } else {
      const subscribersToNotify = [...this.#subscribers];
      subscribersToNotify.forEach((context) => context.notify());
    }
  }

  /**
   * Gets the signal's value.
   * If accessed within an active effect context, establishes a dependency link.
   */
  get value(): T | undefined {
    if (current_context) {
      current_context.link(this); // Link context -> signal (for cleanup)
      this.#subscribers.add(current_context); // Link signal -> context (for notification)
    }
    return this.#value;
  }

  /**
   * Gets the signal's current value without establishing a dependency.
   * Useful for reading the value outside of reactive contexts or within computations
   * where you don't want to track the signal as a dependency.
   * @returns The current value of the signal.
   */
  peek(): T | undefined {
    return this.#value;
  }

  /**
   * Internal method: Remove a subscriber (effect context).
   * Called automatically during effect cleanup.
   * @param context The context (effect) to remove.
   * @internal
   */
  _unsubscribe(context: Context): void {
    this.#subscribers.delete(context);
  }
}

/** The currently active effect context, if any. */
let current_context: Context | undefined = undefined;
/** Set of contexts to notify after a batch operation completes. */
const batch_contexts: Set<Context> = new Set();
/** Flag indicating if batching is currently active. */
let is_batching: boolean = false;

/**
 * Creates an effect that runs initially and automatically re-runs
 * whenever any signal dependencies accessed within it change.
 * @param fn The effect function. It can optionally return a cleanup function
 *           that will be executed before the next effect run or when the effect is disposed.
 * @returns A dispose function to manually stop the effect and run the final cleanup.
 */
export function effect(fn: EffectCallback): () => void {
  let cleanup_fn: (() => void) | void | undefined;
  const dependencies: Set<Signal<any>> = new Set();

  const effect_context: Context = { notify: execute, link };

  /** Links a signal as a dependency of this effect. */
  function link(signal: Signal<any>): void {
    dependencies.add(signal); // Track signal dependencies for cleanup
  }

  /** Executes the effect function and handles cleanup. */
  function execute(): void {
    disposeDependencies();

    current_context = effect_context;
    try {
      cleanup_fn = fn();
    } finally {
      current_context = undefined;
    }
  }

  /** Cleans up dependencies and runs the associated cleanup function. */
  function disposeDependencies(): void {
    dependencies.forEach((signal) => signal._unsubscribe(effect_context));
    dependencies.clear();
  }

  if (typeof cleanup_fn === "function") {
    cleanup_fn();
    cleanup_fn = undefined;
  }

  /** Disposes of the effect permanently. */
  function dispose(): void {
    disposeDependencies();
  }

  execute();

  return dispose;
}

/**
 * Represents a read-only signal whose value is computed based on other signals.
 * @template T The type of the computed value.
 */
export interface ComputedSignal<T> {
  /** Gets the computed value. Accessing this within an effect tracks dependencies. */
  readonly value: T;
  /** Gets the computed value without tracking dependencies. */
  readonly peek: () => T;
}

/**
 * Creates a read-only signal whose value is derived from other signals.
 * The computation function re-runs automatically when its dependencies change.
 * @template T The type of the computed value.
 * @param fn The computation function that returns the derived value.
 * @returns A `ComputedSignal<T>` object.
 */
export function computed<T>(fn: () => T): ComputedSignal<T> {
  const signal = new Signal<T | undefined>(undefined);

  effect(() => {
    const newValue = fn();
    signal.value = newValue;
  });

  return {
    /** Gets the computed value, establishing dependencies if in an effect context. */
    get value(): T {
      return signal.value as T;
    },
    /** Gets the computed value without establishing dependencies. */
    peek(): T {
      return signal.peek() as T;
    },
  };
}

/**
 * Batches multiple signal updates together. Effects dependent on the
 * updated signals within the batch will run only once after the batch completes.
 * @param fn The function containing the signal updates to batch.
 */
export function batch(fn: () => void): void {
  if (is_batching) {
    fn();
    return;
  }

  is_batching = true;
  try {
    fn();
  } finally {
    is_batching = false;
    const contextsToNotify = [...batch_contexts];
    batch_contexts.clear();
    contextsToNotify.forEach((context) => context.notify());
  }
}
