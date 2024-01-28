import { batch, effect, Signal } from "../src/signal.js"

let s_age = new Signal(0)


let s_name = new Signal("")


/**@type {Signal<string[]>} */
let s_list = new Signal([])



effect(() => {
  console.log(s_name.value, s_age.value, s_list.value)
})


batch(() => {
  s_name.value = "Good Boy"
  s_age.value = 55

  s_list.value.push("First", "Second", "3rd")
  s_list.signal()
})
