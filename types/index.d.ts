/**
 * Creates an effect that runs initially and whenever its tracked signal dependencies change.
 * @param {EffectCallback} fn The effect function. It can optionally return a cleanup function.
 * @returns {() => void} A dispose function to manually stop the effect and clean up.
 */
export function effect(fn: EffectCallback): () => void;
/**
 * @template T
 * @typedef {{ readonly value: T, readonly peek: () => T }} ComputedSignal
 */
/**
 * Creates a read-only signal whose value is derived from other signals.
 * The computation function runs only when its dependencies change.
 * @template T
 * @param {() => T} fn The computation function.
 * @returns {ComputedSignal<T>} A computed signal object with `value` and `peek` getters.
 */
export function computed<T>(fn: () => T): ComputedSignal<T>;
/**
 * Batches multiple signal updates, running dependent effects only once at the end.
 * @param {() => void} fn The function containing signal updates to batch.
 */
export function batch(fn: () => void): void;
/**
 * @module signals
 */
/** @typedef {() => (void | (() => void))} EffectCallback Function passed to effect, optionally returns a cleanup function. */
/** @typedef {string} ContextID */ /** @typedef {{notify:()=>void, link:(signal:Signal<any>)=>void}} Context Represents an effect's context for dependency tracking. */
/**
 * @template T
 * Signal class: Holds state and notifies dependents on change.
 */
export class Signal<T> {
    /** @param {T} [init] */
    constructor(init?: T | undefined);
    /**
     * Sets the signal's value and notifies subscribers.
     * @param {T} v The new value.
     */
    set value(v: T);
    /**
     * Gets the signal's value. If inside an effect context, establishes a dependency.
     * @type {T}
     */
    get value(): T;
    /**
     * Gets the signal's value without establishing a dependency.
     * @returns {T}
     */
    peek(): T;
    /**
     * Internal method: Remove a subscriber (effect context).
     * Called during effect cleanup.
     * @param {Context} context
     * @internal
     */
    _unsubscribe(context: Context): void;
    #private;
}
export type ComputedSignal<T> = {
    readonly value: T;
    readonly peek: () => T;
};
/**
 * Function passed to effect, optionally returns a cleanup function.
 */
export type EffectCallback = () => (void | (() => void));
export type ContextID = string;
/**
 * Represents an effect's context for dependency tracking.
 */
export type Context = {
    notify: () => void;
    link: (signal: Signal<any>) => void;
};
