customElements.define('my-timer', class extends HTMLElement {
    constructor() {
        super()
        this.seconds = this.getAttribute('seconds') || undefined
    }
    connectedCallback() {
        this.formattedTime(this.seconds)
    }
    disconnectedCallback() {

    }
    static get observedAttributes() {
        return ['seconds']
    }
    attributeChangedCallback(name, oldValue, newValue) {

    }
    formattedTime(seconds) {
        let formattedTime = ''

        if (seconds >= 3600) {
            this.hours = Math.floor(seconds / 3600)
            seconds %= 3600
        } else {
            this.hours = 0
        }
    
        this.minutes = Math.floor(seconds / 60)
        this.seconds = seconds % 60
    
        if (this.hours > 0) {
            formattedTime += `${this.hours.toString().padStart(2, '0')}:`
        }
    
        if (this.minutes > 0 || this.hours > 0) {
            formattedTime += `${this.minutes.toString().padStart(2, '0')}:`
        }
    
        formattedTime += this.seconds.toString().padStart(2, '0')
    
        console.log('Форматированное время:', formattedTime)
    }
})