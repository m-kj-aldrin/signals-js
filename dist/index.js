var p = (t, e, n) => {
  if (!e.has(t))
    throw TypeError("Cannot " + n);
};
var c = (t, e, n) => (p(t, e, "read from private field"), n ? n.call(t) : e.get(t)), d = (t, e, n) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, n);
}, h = (t, e, n, s) => (p(t, e, "write to private field"), s ? s.call(t, n) : e.set(t, n), n);
var f, i;
class E {
  /** @param {T} [init] */
  constructor(e) {
    /** @type {T} */
    d(this, f, void 0);
    /**@type {Set<Context>} */
    d(this, i, /* @__PURE__ */ new Set());
    h(this, f, e);
  }
  // get derived_refs() {
  //   return this.#derived_references;
  // }
  /**
   * set: sets value and runs all the effects referencing this Signal
   */
  set value(e) {
    h(this, f, e), o ? c(this, i).forEach((n) => l.add(n)) : [...c(this, i)].forEach((n) => n.notify());
  }
  /**
   *
   * get inside effect: adds the current effect to this signals references
   * @type {T}
   */
  get value() {
    return a && (a.link(this), c(this, i).add(a)), c(this, f);
  }
  // get peek() {
  //   return this.#value;
  // }
  /**
   * Run all the referenced effects manually
   */
  signal() {
    o ? c(this, i).forEach((e) => l.add(e)) : c(this, i).forEach((e) => e.notify());
  }
  /**
   * Removes an effect based on effect callback
   * @param {Context} fn
   */
  clear(e) {
    c(this, i).delete(e);
  }
}
f = new WeakMap(), i = new WeakMap();
let a, o = !1, l = /* @__PURE__ */ new Set();
function b(t, e = void 0) {
  let n, s = /* @__PURE__ */ new Set(), u = { notify: _, link: x };
  function x(r) {
    s.add(r);
  }
  function _() {
    g(), a = u, n = t(), a = void 0;
  }
  function g() {
    s.forEach((r) => r.clear(u)), typeof n == "function" && (n(), console.log("inside dispose"));
  }
  return _(), g;
}
async function w(t) {
  o = !0, await t(), o = !1, l.forEach((e) => e.notify()), l.clear();
}
export {
  E as Signal,
  w as batch,
  b as effect
};
