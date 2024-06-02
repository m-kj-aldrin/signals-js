/**@typedef {()=>void} Context */
/**@typedef {()=>Promise<void>} PromiseContext */
/**@typedef {string} ContextID */

/**
 * @template T
 */
export class Signal {
  /** @type {T} */
  #value;

  /**@type {Set<Context>} */
  #context_references = new Set();

  /**@type {Set<Derived>} */
  #derived_references = new Set();

  static group() {
    /**@type {Set<Signal>} */
    let group = new Set();

    return {
      /**@param {Signal} signal */
      add(signal) {
        group.add(signal);
      },
      clear_effects() {
        group.forEach((s) => s.#context_references.clear());
      },
    };
  }

  /** @param {T} init */
  constructor(init) {
    this.#value = init;
  }

  get derived_refs() {
    return this.#derived_references;
  }

  /**
   * set: sets value and runs all the effects referencing this Signal
   */
  set value(v) {
    this.#value = v;

    if (is_batching) {
      this.#context_references.forEach((context) => batch_context.add(context));
    } else {
      this.#context_references.forEach((context) => context());
    }
  }

  /**
   *
   * get inside effect: adds the current effect to this signals references
   * @type {T}
   */
  get value() {
    if (current_derived) {
      this.#derived_references.add(current_derived);
    }
    if (current_context) {
      dependent_signals.add(this);
      this.#context_references.add(current_context);
    }

    return this.#value;
  }

  /**
   * Run all the referenced effects manually
   */
  signal() {
    if (is_batching) {
      this.#context_references.forEach((context) => batch_context.add(context));
    } else {
      this.#context_references.forEach((context) => context());
    }
  }

  /**
   * Removes an effect based on id
   * @param {Context} fn
   */
  clear(fn) {
    this.#context_references.delete(fn);
  }
}

/**
 * @template {()=>any} T
 * @extends {Signal<ReturnType<T>>}
 */
export class Derived extends Signal {
  /**
   * @param {T} fn
   */
  constructor(fn) {
    super();

    current_derived = this;
    effect(() => {
      this.value = fn();
    });
    current_derived = undefined;
  }
}

let current_context = undefined;
/**@type {string} */
let current_context_id = undefined;

/**@type {Derived} */
let current_derived = undefined;

/**@type {Set<Signal|Derived>} */
let dependent_signals = new Set();

let is_batching = false;
/** @type {Set<Context>} */
let batch_context = new Set();

/**
 * Create an effect that runs every time the value of Signal is set
 * @param {Context} fn
 * @param {string} id
 */
export function effect(fn, id = undefined) {
  current_context_id = id;
  current_context = fn;
  fn();
  current_context = undefined;
  current_context_id = undefined;

  let derives = [...dependent_signals.values()].filter((s) => s instanceof Derived);
  dependent_signals.forEach((s) => {
    derives.forEach((d) => {
      if (s.derived_refs.has(d)) {
        d.clear(fn);
      }
    });
  });
  dependent_signals.clear();
  return fn;
}

/**
 * setting value of signals inside a batch fn only signals dependent effects once if multiple signals shares same effects, if fn returns promise dependent effect is run when it resolves
 * @param {Context | PromiseContext} fn
 */
export async function batch(fn) {
  is_batching = true;
  await fn();
  is_batching = false;
  batch_context.forEach((context) => context());
  batch_context.clear();
}
