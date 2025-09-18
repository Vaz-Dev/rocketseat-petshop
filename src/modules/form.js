import dayjs from "dayjs"
import data from "./data"

export default {
    formWrapper: document.getElementById("formWrapper"),
    toggle(){
        this.formWrapper.classList.toggle("hidden")
    },
    morningList: document.getElementById("morningList"),
    dayList: document.getElementById("dayList"),
    nightList: document.getElementById("nightList"),
    async updateLists(date = dayjs()){
        const earlyHour = dayjs(date).hour(0).valueOf()
        const lateHour = dayjs(date).hour(23).valueOf()
        const {morning,day,night} = data.organizeSchedules(await data.getSchedule(earlyHour,lateHour))
        if (morning.length != 0 ) {
            this.morningList.innerHTML = ""
        } else {
            this.morningList.innerHTML = `
            <li><p class="grow small">Nenhum agendamento.</p></li>
        `}
        if (day.length != 0 ) {
            this.dayList.innerHTML = ""
        } else {
            this.dayList.innerHTML = `
            <li><p class="grow small">Nenhum agendamento.</p></li>
        `}
        if (night.length != 0 ) {
            this.nightList.innerHTML = ""
        } else {
            this.nightList.innerHTML = `
            <li><p class="grow small">Nenhum agendamento.</p></li>
        `}
        for (const schedule of morning){
            const item = document.createElement("li")
            item.setAttribute('data-id',schedule.id)
            item.innerHTML = `
                <label>${dayjs(Number(schedule.id)).hour()}:00</label>
                <p class="grow small"><span>${schedule.pet}</span> / ${schedule.owner}</p>
                <p class="grow small">${schedule.desc}</p>
                <p class="remove small">Remover agendamento</p>
            `
            this.morningList.append(item)
        }
        for (const schedule of day){
            const item = document.createElement("li")
            item.setAttribute('data-id',schedule.id)
            item.innerHTML = `
                <label>${dayjs(Number(schedule.id)).hour()}:00</label>
                <p class="grow small"><span>${schedule.pet}</span> / ${schedule.owner}</p>
                <p class="grow small">${schedule.desc}</p>
                <p class="remove small">Remover agendamento</p>
            `
            this.dayList.append(item)
        }
        for (const schedule of night){
            const item = document.createElement("li")
            item.setAttribute('data-id',schedule.id)
            item.innerHTML = `
                <label>${dayjs(Number(schedule.id)).hour()}:00</label>
                <p class="grow small"><span>${schedule.pet}</span> / ${schedule.owner}</p>
                <p class="grow small">${schedule.desc}</p>
                <p class="remove small">Remover agendamento</p>
            `
            this.nightList.append(item)
        }
        this.readyRemoves()
    },
    readyRemoves(){
        const allRemoves = document.querySelectorAll(".remove")
        for (const remove of allRemoves){
            remove.addEventListener("click",(event) => {
                const item = event.target.closest('li')
                const idAPI = item.dataset.id
                data.deleteSchedule(idAPI).then(() => {
                    item.remove()
                }).catch(error => {
                    alert("Failed to delete entry from API")
                })
            })
        }
    },
    form: document.querySelector("form"),
    async readyForm(){
        const ownerInput = document.getElementById("ownerInput")
        const petInput = document.getElementById("petInput")
        const phoneInput = document.getElementById("phoneInput")
        const descInput = document.getElementById("descInput")
        const dateInput = document.getElementById("dateInput")
        const timeInput = document.getElementById("timeInput")
        console.log(dateInput,timeInput)
        this.form.onsubmit = async (e) => {
            try {
                e.preventDefault()
                await data.postSchedule({
                    owner: ownerInput.value,
                    pet: petInput.value,
                    phone: phoneInput.value,
                    desc: descInput.value,
                    id: dayjs(`${dateInput.value}T${timeInput.value}:00`).valueOf()
                })
                location.reload()
            } catch(error) {
                console.log(error)
            }
        }
    }
}