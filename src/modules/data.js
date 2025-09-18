import dayjs from "dayjs"
import { apiConfig } from "../services/api-config"

export default {

    
    
    Schedule: class {

        static workingHours = {
                opening: 9,
                closing: 21
            }

        /**
         * Do not use directly, use postSchedule() instead.
         * 
         * @param {*} owner 
         * @param {*} pet 
         * @param {*} phone 
         * @param {*} desc 
         * @param {*} id 
         */
        constructor (owner,pet,phone,desc,id) {

            if (typeof owner !== 'string') { throw new Error('Dado com tipo inválido: tutor do pet') }
            if (owner.length < 3 || owner.length > 30) { throw new Error('Dado com tamanho inválido: tutor do pet') }
            this.owner = this.constructor.capitalize(owner.trim())

            if (typeof pet !== 'string') { throw new Error('Dado com tipo inválido: nome do pet') }
            if (pet.length < 3 || pet.length > 30) { throw new Error('Dado com tamanho inválido: nome do pet') }
            this.pet = this.constructor.capitalize(pet.trim())

            if (typeof phone !== 'string') { throw new Error('Dado com tipo inválido: Telefone') }
            if (phone.length < 8 || phone.length > 30) { throw new Error('Dado com tamanho inválido: Telefone') }
            if (!this.constructor.phoneRegex.test(phone)) { throw new Error('Dado com caractere(s) inválido(s): Telefone') }
            this.phone = phone.trim()

            if (typeof desc !== 'string') { throw new Error('Dado com tipo inválido: Descrição') }
            if (desc.length < 4 || desc.length > 200) { throw new Error('Dado com tamanho inválido: Descrição') }
            this.desc = desc.trim()

            if (typeof id !== 'number') { throw new Error ('Dado com tipo inválido: Id') }
            if (id < 999999999999) { throw new Error('Dado com tamanho inválido: Id') }
            if (dayjs(id).hour() < this.constructor.workingHours.opening || dayjs(id).hour() >= this.constructor.workingHours.closing) {
                throw new Error('Dado com valor inválido: Id / Escolha um horário válido, não é permitido agendar fora do horário de atendimento.')
            }
            this.id = String(id)
        }

        static capitalize(str) {
            return str.split(' ').map(word => {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }).join(' ');
        }

        static phoneRegex = /^[0-9+ -]+$/

    },

    /**
     * POST a new schedule to the API.
     * * @param {Object} schedule - The schedule object to be posted.
     * @param {string} schedule.owner - The owner's name.
     * @param {string} schedule.pet - The pet's name.
     * @param {string} schedule.phone - The owner's phone number.
     * @param {string} schedule.desc - The description of the service.
     * @param {number} schedule.id - A millisecond Unix timestamp for the appointment.
     */
    async postSchedule({owner,pet,phone,desc,id}) {
        try {
            if (await this.getSchedule(id) != undefined) {throw new Error('Já existe um agendamento neste horário, tente outro.')}
            const newSchedule = new this.Schedule(owner,pet,phone,desc,id)
            await fetch(`${apiConfig.baseURL}/schedules`, {
                method: 'POST',
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(newSchedule)
            })

            alert ("Agendamento realizado com sucesso!")

        } catch (error) {
            alert(error)
            console.log(error)
        }
    },

    /**
     * GET schedules from the API based on a timestamp.
     * * @param {number} time - Required. The Unix timestamp (ID) of the schedule to retrieve.
     * @param {number} [timeOptional=0] - Optional. A second Unix timestamp to return all schedules between the two.
     * @returns {Promise<Object|Object[]|undefined>} A promise that resolves to a single schedule object, an array of schedule objects, or undefined if no schedule is found.
     */
    async getSchedule(time, timeOptional = 0) {
        try {
            const response = await fetch(`${apiConfig.baseURL}/schedules`)
            const data = await response.json()
            if (timeOptional) {
                return await data.filter((schedule) => Number(schedule.id) >= time && Number(schedule.id) <= timeOptional)
            } else {
                return await data.find((schedule) => Number(schedule.id) == time)
            }
        } catch(error) {
            alert(error)
            console.log(error)
        }
    },

    /**
     * DELETE a single schedule from the API, with the ID equal to the parameter.
     * * @param {number} id - A millisecond Unix timestamp to identify the schedule to delete.
     * @returns {Promise<void>} A promise that resolves when the schedule is successfully deleted.
     */
    async deleteSchedule(id) {
        try {
            await fetch(`${apiConfig.baseURL}/schedules/${String(id)}`, {
                method: "DELETE",
            })
            alert("Agendamento cancelado com sucesso!")
        } catch(error) {
            alert(error)
            console.log(error)
        }
    },

    /**
     * Organizes an array of schedules into an object containing three new arrays, once for each work period.
     * * @param {Object[]} scheduleArray An array of schedules, intended to receive a resolved promise from getSchedule(x,y)
     * @returns {{morning: Object[], day: Object[], night: Object[]}}
     */
    organizeSchedules( scheduleArray ) {
        const morningArray = [];
        const dayArray = [];
        const nightArray = [];

        scheduleArray.forEach((schedule) => {
            const hour = dayjs(Number(schedule.id)).hour();
            
            if (hour >= 8 && hour < 12) {
                morningArray.push(schedule);
            } else if (hour >= 12 && hour < 18) {
                dayArray.push(schedule);
            } else if (hour >= 18 && hour < 20) {
                nightArray.push(schedule);
            }
        });

        return {
            morning: morningArray,
            day: dayArray,
            night: nightArray
        }
    }
}