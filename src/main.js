"use strict"

import "./styles/rules.css"
import "./styles/style-guide.css"
import "./styles/core.css"

import "./services/api-config.js"
import "./libs/dayjs.js"
import data from "./modules/data.js"
import form from "./modules/form.js"
import dayjs from "dayjs"


document.addEventListener("DOMContentLoaded", () => {
    const open = document.querySelector("footer button")
    const close = document.getElementById("form-close")
    const viewDate = document.getElementById("viewDate")
    open.addEventListener("click", () => {
        form.toggle()
    })
    close.addEventListener("click", () => {
        form.toggle()
    })
    viewDate.addEventListener("input", () => {
        form.updateLists(viewDate.value)
    })
    form.readyForm()
    form.updateLists()
})