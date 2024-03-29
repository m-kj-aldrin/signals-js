import { batch, effect, Signal } from "../src/signal.js"

let s_age = new Signal(0)

let s_name = new Signal("")
/**@type {Signal<string[]>} */
let s_list = new Signal([])

let age_el = document.createElement("div")
let name_el = document.createElement("div")
let list_el = document.createElement("ul")

document.body.append(age_el, name_el, list_el)

function list_item(value = '', index = 0) {
  const el = document.createElement("li")
  el.innerHTML = `<div>${value}</div>`

  let remove_button = document.createElement("button")
  remove_button.textContent = 'rem'
  el.appendChild(remove_button)

  remove_button.onclick = () => {
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


document.body.appendChild(document.createElement("br"))

// Test for effectgroup/effectid, users should be able to update/reinit/clear an effect based on id/group 
// This ensures that the caller of effect can manage the scope that a signal should know about
// As in the case below, a user picks an pick_item(signal) but should only be able to pick one item and still "listen" for changes on that signal
// We need to clear the old effect before giving the pick_item(signal) an new effect(context)

let picker_button = document.createElement("button")
picker_button.textContent = 'pick'

/**@type {Signal<number>} */
let picker_signal = null

/**
  * @param {MouseEvent & {target:HTMLElement}} e
  * @this {HTMLElement}
  */
function picker_handler(e) {
  if (e.target.getAttribute("data-pick") == 'element') {
    picker_signal?.clear("picker")

    let index = +e.target.getAttribute("data-index")
    let { s } = pick_list_signals[index]
    picker_signal = s


    // This is where the effect is called
    // It needs to be unique
    effect(() => {
      console.log("picked", s.value)
    }, "picker")

    window.removeEventListener("click", bound_picker)
    bound_picker = null
  }
}

/**@type {typeof picker_handler} */
let bound_picker = null

picker_button.addEventListener("click", e => {
  window.addEventListener("click", bound_picker = picker_handler)
})

let pick_list = document.createElement("ul")

let pick_list_signals = [...Array(4)].map((_, i) => {
  let s = new Signal(i)

  let pick_element = document.createElement("li")
  pick_element.setAttribute("data-pick", 'element')

  let text_node = document.createTextNode("")

  let remove_button = document.createElement("button")
  remove_button.textContent = 'rem'

  remove_button.addEventListener("click", () => {
    pick_element.remove()
    pick_list_signals.splice(s.value, 1)
    pick_list_signals.forEach(({ s }, i) => s.value = i)
  })

  pick_element.append(text_node, remove_button)

  let id = crypto.randomUUID().replace(/-.*/, '')

  effect(() => {
    pick_element.setAttribute("data-index", s.value.toString())
    text_node.textContent = `pick item: ${s.value}, id: ${id}`
  })

  return { pick_element, s }
})

pick_list.append(...pick_list_signals.map(({ pick_element }) => pick_element))

document.body.append(picker_button, pick_list)




