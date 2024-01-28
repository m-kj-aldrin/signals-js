/**@typedef {()=>void} Context */
/**@typedef {string} ContextID */

/**
* @template T
*/
export class Signal {
  /** @type {T} */
  #value

  /**@type {Set<[Context,ContextID]>} */
  #context_references = new Set()

  static group() {
    /**@type {Set<Signal>} */
    let group = new Set()

    return {
      /**@param {Signal} signal */
      add(signal) {
        group.add(signal)
      },
      clear_effects() {
        group.forEach(s => s.#context_references.clear())
      }
    }
  }

  /** @param {T} init */
  constructor(init) {
    this.#value = init
  }

  /**
   * If set, runs all the Context referencing this Signal
   */
  set value(v) {
    this.#value = v

    if (is_batching) {
      this.#context_references.forEach(([context]) => batch_context.add(context))
    } else {
      this.#context_references.forEach(([context]) => context())
    }
  }


  /**
   * If get & called inside an effect adds the current Context to this signals references
   */
  get value() {
    if (current_context) {
      this.#context_references.add([current_context, current_context_id])
    }
    return this.#value
  }

  /**
   * Run all the referenced effects manually 
   */
  signal() {
    if (is_batching) {
      this.#context_references.forEach(([context]) => batch_context.add(context))
    } else {
      this.#context_references.forEach(([context]) => context())
    }
  }

  /**
   * Removes an effect based on id
   * @param {ContextID} id
   */
  clear(id) {
    let c = [...this.#context_references].find(([_, context_id]) => context_id == id)
    this.#context_references.delete(c)
  }
}

let current_context = undefined
/**@type {string} */
let current_context_id = undefined

let is_batching = false
/** @type {Set<Context>} */
let batch_context = new Set()

/**
 * Create an effect that runs every time the value of Signal is set
 * @param {Context} fn
 * @param {string} id
 */
export function effect(fn, id = undefined) {
  current_context_id = id
  current_context = fn
  fn()
  current_context = undefined
  current_context_id = undefined
}

/**
 * Updates to signals inside a batch context signals dependent effects only once if multiple signals shares same effects
 * @param {Context} fn
 */
export function batch(fn) {
  is_batching = true
  fn()
  is_batching = false
  batch_context.forEach((context) => context())
  batch_context.clear()
}
