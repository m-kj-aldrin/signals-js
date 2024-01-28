import { batch, effect, Signal } from "../src/signal.js"

let s_age = new Signal(0)


let s_name = new Signal("")


/**@type {Signal<string[]>} */
let s_list = new Signal([])


let age_el = document.createElement("div")
let name_el = document.createElement("div")
let list_el = document.createElement("ul")

document.body.append(age_el, name_el, list_el)

function list_item(value, index = 0) {
  const el = document.createElement("li")
  el.innerHTML = `<div>${value}</div>`

  let remove_button = document.createElement("button")
  remove_button.textContent = 'rem'
  el.appendChild(remove_button)

  remove_button.onclick = e => {
    s_list.value.splice(index, 1)
    s_list.signal()
  }

  return el
}

effect(() => {
  age_el.textContent = `age: ${s_age.value.toString()}`
  name_el.textContent = `name: ${s_name.value}`

  list_el.innerHTML = ''
  list_el.append(...s_list.value.map((v, i) => list_item(v, i)))

})

let list_input = document.createElement("input")
list_input.addEventListener("change",
  /** @param {InputEvent & {target:HTMLInputElement}} e */ e => {
    s_list.value.push(e.target.value)
    s_list.signal()
    e.target.value = ''
  })

document.body.appendChild(list_input)
