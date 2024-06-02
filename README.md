# Signal

Implementation of signals pattern

```javascript
import { Signal, Derived, effect, batch } from "@mkja/signal";

const factor0 = new Signal(0); // @type {Signal<number>}
const factor1 = new Signal(0); // @type {Signal<number>}

//Type of dervied is based on return type of the callback function
const product = new Derived(() => factor0.value * factor1.value); // @type {Derived<number>}

//Effect only runs once if updates to factor0,factor1 or product is done
effect(() => {
  console.log(`${factor0.value} * ${factor1.value} = ${product.value}`);
});

// Updates to signals inside batch runs dependent effets only once even if multiple signals is part of an effect
batch(() => {
  // Calls above effect only once
  factor0.value = 2;
  factor1.value = 3;
});

// Can return an promise to handle async updates
batch(() => {
  // Calls the above effect when Promise.all resolves
  return Promise.all([
    new Promise((res) => {
      setTimeout(() => {
        factor0.value = 5;
      }, 500);
    }),
    new Promise((res) => {
      setTimeout(() => {
        factor1.value = 7;
      }, 1000);
    }),
  ]);
});
```
