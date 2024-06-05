/**
 * @module signals
 */

/**@typedef {()=>()=>void} EffectCallback */
/**@typedef {()=>Promise<void>} PromiseContext */
/**@typedef {string} ContextID */
/**@typedef {{notify:()=>void,link:(signal:Signal)=>void}} Context */

/**
 * @template T
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

  // get derived_refs() {
  //   return this.#derived_references;
  // }

  /**
   * set: sets value and runs all the effects referencing this Signal
   */
  set value(v) {
    this.#value = v;

    if (is_batching) {
      this.#context_references.forEach((context) => batch_context.add(context));
    } else {
      // this.#context_references.forEach((context) => context());
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

  // get peek() {
  //   return this.#value;
  // }

  /**
   * Run all the referenced effects manually
   */
  signal() {
    if (is_batching) {
      this.#context_references.forEach((context) => batch_context.add(context));
    } else {
      this.#context_references.forEach((context) => context.notify());
    }
  }

  /**
   * Removes an effect based on effect callback
   * @param {Context} fn
   */
  clear(fn) {
    this.#context_references.delete(fn);
  }
}

// /**
//  * @template {()=>any} T
//  * @extends {Signal<ReturnType<T>>}
//  */
// export class Derived extends Signal {
//   /**
//    * @param {T} fn
//    */
//   constructor(fn) {
//     super();

//     current_derived = this;
//     effect(() => {
//       this.value = fn();
//     });
//     current_derived = undefined;
//   }
// }

/**@type {Context} */
let current_context = undefined;

// /**@type {Set<Signal|Derived>} */
// let dependent_signals = new Set();

let is_batching = false;
/** @type {Set<Context>} */
let batch_context = new Set();

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
      console.log('inside dispose');
    }
  }

  execute();

  return dispose;
}

/**
 * setting value of signals inside a batch fn only signals dependent effects once if multiple signals shares same effects, if fn returns promise dependent effect is run when it resolves
 * @param {EffectCallback | PromiseContext} fn
 */
export async function batch(fn) {
  is_batching = true;
  await fn();
  is_batching = false;
  batch_context.forEach((context) => context.notify());
  batch_context.clear();
}
