/**
 * @module signals
 */

/**@typedef {()=>()=>void} EffectCallback */
/**@typedef {()=>Promise<void>} PromiseContext */
/**@typedef {string} ContextID */
/**@typedef {{notify:()=>void,link:(signal:Signal)=>void}} Context */

/**
 * @template T
 * Signal class
 */
export class Signal {
  /** @type {T} */
  #value;

  /**@type {Set<Context>} */
  #context_references = new Set();

  /** @param {T} [init] */
  constructor(init) {
    this.#value = init;
  }

  /**
   * set: sets value and notify all dependent effects
   */
  set value(v) {
    if (this.peek() === v) return;

    this.#value = v;

    if (is_batching) {
      this.#context_references.forEach((context) => batch_context.add(context));
    } else {
      [...this.#context_references].forEach((context) => context.notify());
    }
  }

  /**
   *
   * get inside effect: adds the signal as a dependency to the effect
   * @type {T}
   */
  get value() {
    if (current_context) {
      current_context.link(this);
      this.#context_references.add(current_context);
    }

    return this.#value;
  }

  peek() {
    return this.#value;
  }

  /**
   * Removes an effect based on effect context(returned by the effect function)
   * @param {Context} fn
   */
  clear(fn) {
    this.#context_references.delete(fn);
  }
}

/**
 * @template {()=>any} T
 */
export class Derived {
  /**@type {Signal<ReturnType<T>>} */
  #signal;

  /**
   * @param {T} fn
   */
  constructor(fn) {
    /**@type {Signal<ReturnType<T>>} */
    this.#signal = new Signal();

    effect(() => {
      let newValue = fn();
      if (this.#signal.peek() !== newValue) {
        this.#signal.value = newValue;
      }
    });
  }
  get value() {
    return this.#signal.value;
  }
  peek() {
    return this.#signal.peek();
  }
}

/**@type {Context} */
let current_context = undefined;

/**
 * Create an effect that runs every time the value of dependent Signals is set
 * @param {EffectCallback} fn
 */
export function effect(fn) {
  /**@type {()=>void} */
  let clean_up_fn;

  /**@type {Set<Signal>} */
  let disposeable_signals = new Set();

  /**@type {Context} */
  let effect_context = { notify: execute, link };

  /**@param {Signal} signal */
  function link(signal) {
    disposeable_signals.add(signal);
  }

  function execute() {
    dispose();

    current_context = effect_context;
    clean_up_fn = fn();
    current_context = undefined;
  }

  function dispose() {
    disposeable_signals.forEach((signal) => signal.clear(effect_context));
    if (typeof clean_up_fn === "function") {
      clean_up_fn();
    }
  }

  execute();

  return dispose;
}

let is_batching = false;

/**@type {Set<Context>} */
const batch_context = new Set();

/**
 * setting value of signals inside a batch fn only notifies dependent effects once if multiple signals shares same effects
 * @param {EffectCallback} fn
 */
export function batch(fn) {
  is_batching = true;
  fn();
  is_batching = false;
  batch_context.forEach((context) => context.notify());
  batch_context.clear();
}
