/**
 * @module signals
 */

/**@typedef {()=>()=>void} EffectCallback */
/**@typedef {()=>Promise<void>} PromiseContext */
/**@typedef {string} ContextID */
/**@typedef {{notify:()=>void,link:(signal:Signal)=>void}} Context */

/**
 * @template T
 * Class for a Signal
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
   * set: sets value and runs all the effects referencing this Signal
   */
  set value(v) {
    if (this.peek() === v) return;

    this.#value = v;

    if (current_batch_context) {
      // this.#context_references.forEach((context) => batch_context.add(context));
      this.#context_references.forEach((context) => current_batch_context.contexts.add(context));
    } else {
      [...this.#context_references].forEach((context) => context.notify());
    }
  }

  /**
   *
   * get inside effect: adds the current effect to this signals references
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
   * Removes an effect based on effect callback
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

/**@type {BatchContext} */
let current_batch_context = undefined;

// /**@type {Set<Signal|Derived>} */
// let dependent_signals = new Set();

// let is_batching = false;
// /** @type {Set<Context>} */
// let batch_context = new Set();

/**
 * Create an effect that runs every time the value of Signal is set
 * @param {EffectCallback} fn
 * @param {string} id
 */
export function effect(fn, id = undefined) {
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

/**
 * @typedef {Object} BatchContext
 * @prop {(signal:Signal)=>void} link
 * @prop {Set<Context>} contexts
 */

/**@type {Set<BatchContext>} */
const batch_contexts = new Set();

/**
 * setting value of signals inside a batch fn only signals dependent effects once if multiple signals shares same effects, if fn returns promise dependent effect is run when it resolves
 * @param {EffectCallback | PromiseContext} fn
 */
export async function batch(fn) {
  /**@type {Set<Signal>} */
  let disposeable_signals = new Set();

  /**@param {Signal} signal */
  function link(signal) {
    disposeable_signals.add(signal);
  }

  /**@type {BatchContext} */
  let batch_context_ = { contexts: new Set(), link };

  batch_contexts.add(batch_context_);
  current_batch_context = batch_context_;

  // is_batching = true;
  await fn();

  batch_context_.contexts.forEach((context) => context.notify());
  // is_batching = false;
  // batch_context.forEach((context) => context.notify());

  batch_contexts.delete(batch_context_);
  if (!batch_contexts.size) {
    current_batch_context = undefined;
  }

  // batch_context.clear();
}
