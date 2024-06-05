/**
 * Create an effect that runs every time the value of dependent Signals is set
 * @param {EffectCallback} fn
 */
export function effect(fn: EffectCallback): () => void;
/**
 * setting value of signals inside a batch fn only notifies dependent effects once if multiple signals shares same effects
 * @param {EffectCallback} fn
 */
export function batch(fn: EffectCallback): void;
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
export class Signal<T> {
    /** @param {T} [init] */
    constructor(init?: T | undefined);
    /**
     * set: sets value and notify all dependent effects
     */
    set value(v: T);
    /**
     *
     * get inside effect: adds the signal as a dependency to the effect
     * @type {T}
     */
    get value(): T;
    peek(): T;
    /**
     * Removes an effect based on effect context(returned by the effect function)
     * @param {Context} fn
     */
    clear(fn: Context): void;
    #private;
}
/**
 * @template {()=>any} T
 */
export class Derived<T extends () => any> {
    /**
     * @param {T} fn
     */
    constructor(fn: T);
    get value(): ReturnType<T>;
    peek(): ReturnType<T>;
    #private;
}
export type EffectCallback = () => () => void;
export type PromiseContext = () => Promise<void>;
export type ContextID = string;
export type Context = {
    notify: () => void;
    link: (signal: Signal<any>) => void;
};
