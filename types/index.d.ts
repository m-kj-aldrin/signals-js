/**
 * Create an effect that runs every time the value of Signal is set
 * @param {EffectCallback} fn
 * @param {string} id
 */
export function effect(fn: EffectCallback, id?: string): () => void;
/**
 * setting value of signals inside a batch fn only signals dependent effects once if multiple signals shares same effects, if fn returns promise dependent effect is run when it resolves
 * @param {EffectCallback | PromiseContext} fn
 */
export function batch(fn: EffectCallback | PromiseContext): Promise<void>;
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
export class Signal<T> {
    /** @param {T} [init] */
    constructor(init?: T | undefined);
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
     * Removes an effect based on effect callback
     * @param {Context} fn
     */
    clear(fn: Context): void;
    #private;
}
export type EffectCallback = () => () => void;
export type PromiseContext = () => Promise<void>;
export type ContextID = string;
export type Context = {
    notify: () => void;
    link: (signal: Signal<any>) => void;
};
