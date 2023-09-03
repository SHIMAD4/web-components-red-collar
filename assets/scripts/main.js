customElements.define('my-timer', class extends HTMLElement {
    constructor() {
        super()
        this.seconds = this.getAttribute('seconds') || undefined
        this.minutes = null
        this.hours = null

        this.hoursText = null
        this.minutesText = null
        this.secondsText = null

        this.startTrigger = false
        this.isPaused = false
        this.timerInterval = null

        this.startButton = document.getElementById('startBtn') || undefined
        this.pauseButton = document.getElementById('pauseBtn') || undefined
        this.resetButton = document.getElementById('resetBtn') || undefined
        this.timerDisplay = document.querySelector('.timer__display') || undefined
        
        this._shadow = this.timerDisplay.attachShadow({mode: 'open'})
    }
    
    connectedCallback() {
        this.formattedTime(this.seconds)
        this.startButton.addEventListener('click', () => {this.startTimer()})
        this.pauseButton.addEventListener('click', () => {this.pauseTimer()})
        this.resetButton.addEventListener('click', () => {this.resetTimer()})
        this.timerDisplay.innerText = 'Таймер'
        this._shadow.innerHTML = this.timerDisplay.textContent
    }

    disconnectedCallback() {
        this.startButton.removeEventListener('click', () => {this.startTimer()})
        this.pauseButton.removeEventListener('click', () => {this.pauseTimer()})
        this.resetButton.removeEventListener('click', () => {this.resetTimer()})
    }

    static get observedAttributes() {
        return ['seconds']
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
    }

    formatNumber(num) {
        return num < 10 ? `0${num}` : `${num}`
    }

    numberDisplay() {
        this.hoursText = this.hours === 0 ? '' : this.formatNumber(this.hours)
        this.minutesText = this.minutes === 0 ? '' : this.formatNumber(this.minutes)
        this.secondsText = this.seconds === 0 ? '' : this.formatNumber(this.seconds)
        this._shadow.innerHTML = `${this.hoursText}${this.hoursText && this.minutesText ? ':' : ''}${this.minutesText}${(this.hoursText || this.minutesText) && this.secondsText ? ':' : ''}${this.secondsText}`
    }

    startTimer() {
        if (!this.startTrigger) {
            this.isPaused = false
            this.startTrigger = true
            this.timerInterval = setInterval(() => {
                if (this.startTrigger && !this.isPaused) {
                    this.numberDisplay()
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
                                clearInterval(this.timerInterval)
                                this.timerDisplay.innerText = 'Время кончилось'
                            }
                        }
                    }
                }
            }, 1000)
        }
    }
    
    pauseTimer() {
        this.isPaused = true
        this.startTrigger = false
        if (this.timerInterval && this.isPaused) {
            clearInterval(this.timerInterval)
        }
    }

    resetTimer() {
        this.isPaused = false
        this.startTrigger = false
        clearInterval(this.timerInterval)
        this.formattedTime(this.getAttribute('seconds'))
        this.numberDisplay()
    }
})
