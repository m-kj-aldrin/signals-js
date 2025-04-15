import { computed, Signal, batch, effect } from "../src/index.js";

let factor0 = new Signal(1);
let factor1 = new Signal(2);
let product = computed(() => factor0.value * factor1.value);

const dispose = effect(() => {
  let str = `${factor0.peek()} * ${factor1.peek()} = ${product.value}`;
  console.log(str);

  return () => {
    console.log("clean up fn\n");
  };
});

let v0 = new Promise<number>((res) => {
  setTimeout(() => {
    res(Math.floor(Math.random() * 100));
  }, 500);
});
let v1 = new Promise<number>((res) => {
  setTimeout(() => {
    res(Math.floor(Math.random() * 100));
  }, 700);
});

Promise.all([v0, v1]).then(([v0, v1]) => {
  batch(() => {
    factor0.value = v0;
    factor1.value = v1;
  });
});

let id = setInterval(() => {
  if (product.value > 1000) {
    console.log("over 1000");

    dispose();
    clearInterval(id);
    return;
  }
  factor0.value++;
}, 100);
