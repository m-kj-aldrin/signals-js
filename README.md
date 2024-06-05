# Signals

Implementation of signals pattern

```console
npm i @mkja/signals
```

```javascript
import { Signal, Derived, effect, batch } from "@mkja/signal";

const factor0 = new Signal(0); // @type {Signal<number>}
const factor1 = new Signal(0); // @type {Signal<number>}

//Type of dervied is based on return type of the callback function
const product = new Derived(() => factor0.value * factor1.value); // @type {Derived<number>}

//Effect when product is notify becouse signal.peek() is called on factor0/1 to get a peek of the value without adding the dependencies of the effect
effect(() => {
  console.log(`${factor0.peek()} * ${factor1.peek()} = ${product.value}`);
});

// Updates to signals inside batch runs dependent effets only once even if multiple signals is part of an effect
batch(() => {
  // Calls above effect only once
  factor0.value = 2;
  factor1.value = 3;
});
```
