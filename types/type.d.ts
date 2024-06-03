/**
 * Create an effect that runs every time the value of Signal is set
 * @param {Context} fn
 * @param {string} id
 */
export function effect(fn: Context, id?: string): Context;
/**
 * setting value of signals inside a batch fn only signals dependent effects once if multiple signals shares same effects, if fn returns promise dependent effect is run when it resolves
 * @param {Context | PromiseContext} fn
 */
export function batch(fn: Context | PromiseContext): Promise<void>;
/**
 * @module signals
 */
/**@typedef {()=>void} Context */
/**@typedef {()=>Promise<void>} PromiseContext */
/**@typedef {string} ContextID */
/**
 * @template T
 */
export class Signal<T> {
    static group(): {
        /**@param {Signal} signal */
        add(signal: Signal<any>): void;
        clear_effects(): void;
    };
    /** @param {T} init */
    constructor(init: T);
    get derived_refs(): Set<Derived<any>>;
    /**
     * set: sets value and runs all the effects referencing this Signal
     */
    set value(v: T);
    /**
     *
     * get inside effect: adds the current effect to this signals references
     * @type {T}
     */
    get value(): T;
    /**
     * Run all the referenced effects manually
     */
    signal(): void;
    /**
     * Removes an effect based on id
     * @param {Context} fn
     */
    clear(fn: Context): void;
    #private;
}
/**
 * @template {()=>any} T
 * @extends {Signal<ReturnType<T>>}
 */
export class Derived<T extends () => any> extends Signal<ReturnType<T>> {
    /**
     * @param {T} fn
     */
    constructor(fn: T);
}
export type Context = () => void;
export type PromiseContext = () => Promise<void>;
export type ContextID = string;
