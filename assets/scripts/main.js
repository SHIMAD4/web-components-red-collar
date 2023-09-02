customElements.define('my-timer', class extends HTMLElement {
    constructor() {
        super()
        this.seconds = this.getAttribute('seconds') || undefined
        this.minutes = null
        this.hours = null
        this.startTrigger = false
        this.startButton = document.getElementById('startBtn') || undefined
        this.timerDisplay = document.querySelector('.timer__display') || undefined
    }
    connectedCallback() {
        // this._shadow = this.attachShadow({mode: 'open'})
        // const p = document.querySelector('.timer__display')
        // p.innerHTML = 'Таймер'
        // this._shadow.append(p)
        
        this.formattedTime(this.seconds)
        this.startButton.addEventListener('click', () => {this.startTimer()})
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

    startTimer() {
        this.startTrigger = true;
    
        const timerInterval = setInterval(() => {
            if (this.startTrigger) {
                const formatNumber = (num) => (num < 10 ? `0${num}` : `${num}`);
                const hoursText = this.hours === 0 ? '' : formatNumber(this.hours);
                const minutesText = this.minutes === 0 ? '' : formatNumber(this.minutes);
                const secondsText = this.seconds === 0 ? '' : formatNumber(this.seconds);

                this.timerDisplay.innerText = `${hoursText}${hoursText && minutesText ? ':' : ''}${minutesText}${(hoursText || minutesText) && secondsText ? ':' : ''}${secondsText}`;
                        
                if (this.seconds > 0) {
                    this.seconds -= 1
                } else {
                    if (this.minutes > 0) {
                        this.minutes -= 1
                        this.seconds = 59
                    } else {
                        if (this.hours > 0) {
                            this.hours -= 1
                            this.minutes = 59
                            this.seconds = 59
                        } else {
                            this.startTrigger = false
                            clearInterval(timerInterval)
                            this.timerDisplay.innerText = 'Время кончилось'
                        }
                    }
                }
            }
        }, 1000)
    }
})