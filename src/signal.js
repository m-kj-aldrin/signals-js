/**
* @typedef {()=>void} Context
*/

/**
* @template T
*/
export class Signal {
  /** @type {T} */
  #value

  /**@type {Set<[Context]>} */
  #context_references = new Set()

  static group() {
  }

  /** @param {T} init */
  constructor(init) {
    this.#value = init
  }

  set value(v) {
    this.#value = v

    if (is_batching) {
      this.#context_references.forEach(([context]) => batch_context.add(context))
    } else {
      this.#context_references.forEach(([context]) => context())
    }
  }

  signal() {
    if (is_batching) {
      this.#context_references.forEach(([context]) => batch_context.add(context))
    } else {
      this.#context_references.forEach(([context]) => context())
    }
  }

  get value() {
    if (current_context) {
      this.#context_references.add([current_context])
    }
    return this.#value
  }
}

let current_context = undefined
let is_batching = false
/** @type {Set<Context>} */
let batch_context = new Set()

/**
* @param {Context} fn
*/
export function effect(fn) {
  current_context = fn
  fn()
  current_context = undefined
}

/**
* @param {Context} fn
*/
export function batch(fn) {
  is_batching = true
  fn()
  is_batching = false
  batch_context.forEach((context) => context())
  batch_context.clear()
}
