// Регистрация пользовательского компонента и инициализация его класса
customElements.define('my-timer', class extends HTMLElement {
    constructor() {
        super()
        // Инициализация секунд, минут и часов
        this.time = this.getAttribute('to-time') || undefined
        this.seconds = this.getAttribute('seconds') || undefined
        this.minutes = null
        this.hours = null

        // Инициализация секунд, минут и часов для вывода на экран
        this.hoursText = null
        this.minutesText = null
        this.secondsText = null

        // Инициализация триггеров для работы таймера
        this.startTrigger = false
        this.isPaused = false

        // Инициализация интервала
        this.timerInterval = null

        // Инициализация кнопок таймера и блока для вывода на экран
        this.startButton = document.getElementById('startBtn') || undefined
        this.pauseButton = document.getElementById('pauseBtn') || undefined
        this.resetButton = document.getElementById('resetBtn') || undefined
        this.timerDisplay = document.querySelector('.timer__display') || undefined
        
        // Инициализация теневого дерева
        this._shadow = this.timerDisplay.attachShadow({mode: 'closed'})

        // Инициализация пользовательских событий
        this.startTimerEvent = new Event('starttimer')
        this.pauseTimerEvent = new Event('pausetimer')
        this.resetTimerEvent = new Event('resettimer')
        this.endTimerEvent = new Event('endtimer')
    }
    
    // Инициализация метода при подключении таймера в документ
    connectedCallback() {
        this._nowTime = new Date().toLocaleTimeString('ru-RU')

        // Вызов метода для форматирования секунд в ЧЧ:ММ:СС формат
        if(this.seconds) {
            this.formattedTime(this.seconds)
        } else if(this.time) {
            this.formattedTime(this.time)
        }

        this.startButton.addEventListener('click', () => {                          // Привязка события по клику
            this.startButton.dispatchEvent(this.startTimerEvent)                    // Вызов события по старту таймера
        })
        this.startButton.addEventListener('starttimer', () => this.startTimer())    // Привязка события по старту таймера
        
        this.pauseButton.addEventListener('click', () => {                          // Привязка события по клику
            this.pauseButton.dispatchEvent(this.pauseTimerEvent)                    // Вызов события по паузе таймера
        })
        this.pauseButton.addEventListener('pausetimer', () => this.pauseTimer())    // Привязка события по паузе таймера
        
        this.resetButton.addEventListener('click', () => {                          // Привязка события по клику
            this.resetButton.dispatchEvent(this.resetTimerEvent)                    // Вызов события по откату таймера
        })
        this.resetButton.addEventListener('resettimer', () => this.resetTimer())    // Привязка события по откату таймера
        
        this.timerDisplay.addEventListener('endtimer', () => {                      // Привязка события по окончанию таймера
            clearInterval(this.timerInterval)                                       // Очиска интервала
            this._shadow.innerHTML = 'Время кончилось'                              // Вставка текста при окончании таймера
        })
        this._shadow.innerHTML = 'Таймер'                                           // Начальный вывод текста в таймер
    }

    // Инициализация метода при отключения таймера из документа
    disconnectedCallback() {
        // Удаление всех слушателей на кнопках
        this.startButton.removeEventListener('click', () => {this.startTimer()})
        this.pauseButton.removeEventListener('click', () => {this.pauseTimer()})
        this.resetButton.removeEventListener('click', () => {this.resetTimer()})
    }

    // Инициализация геттера для получения всех атрибутов
    static get observedAttributes() {
        return ['seconds', 'to-time']
    }

    // Инициализация метода для форматирования времени в ЧЧ:ММ:СС формат
    formattedTime(time) {
        let formattedTime = ''                             // Инициализация начальной строки
        const currentTime = new Date().getTime() / 1000    // Текущее время в секундах
    
        if (time.indexOf(':') !== -1) {
            const timeParts = time.split(':')
            
            if (timeParts.length === 3) {
                const targetTime = new Date().setHours(+timeParts[0], +timeParts[1], +timeParts[2]) / 1000
                let timeDifference = targetTime - currentTime
    
                if (timeDifference >= 0) {
                    this.hours = Math.floor(timeDifference / 3600)
                    timeDifference %= 3600
                    this.minutes = Math.floor(timeDifference / 60)
                    this.seconds = Math.floor(timeDifference % 60)
                } else {
                    // Обработка случая, когда переданное время уже прошло
                    console.error('Полученное время меньше текущего времени.')
                    return
                }
            } else {
                // Обработка неверного формата времени
                console.error('Неверный формат времени. Используйте ЧЧ:ММ:СС.')
                return
            }
        } else {
            // Обработка времени в секундах
            if (time >= 3600) {
                this.hours = Math.floor(time / 3600)
                time %= 3600
            } else {
                this.hours = 0
            }
    
            this.minutes = Math.floor(time / 60)
            this.seconds = time % 60
        }
    
        if (this.hours > 0) {
            formattedTime += `${this.formatNumber(this.hours)}:`
        }
    
        if (this.minutes > 0 || this.hours > 0) {
            formattedTime += `${this.formatNumber(this.minutes)}:`
        }
    
        formattedTime += this.formatNumber(this.seconds)
        this.numberDisplay()
    }

    // Инициализация метода для форматирования времени если присутствует 0 перед числом
    formatNumber(num) {
        return num < 10 ? `0${num}` : `${num}`
    }

    // Инициализация метода для форматирования времени если кончились часы, минуты, секунды и их вывод
    numberDisplay() {
        this.hoursText = this.hours === 0 ? '' : this.formatNumber(this.hours)
        this.minutesText = this.minutes === 0 ? '' : this.formatNumber(this.minutes)
        this.secondsText = this.seconds === 0 ? '00' : this.formatNumber(this.seconds)
        this._shadow.innerHTML = `${this.hoursText}${this.hoursText && this.minutesText ? ':' : ''}${this.minutesText}${(this.hoursText || this.minutesText) && this.secondsText ? ':' : ''}${this.secondsText}`
    }

    // Инициализация метода для старта таймера
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
                                this.timerDisplay.dispatchEvent(this.endTimerEvent)    // Вызов пользовательского события
                            }
                        }
                    }
                }
            }, 1000)
        }
    }
    
    // Инициализация метода для остановки таймера
    pauseTimer() {
        this.isPaused = true
        this.startTrigger = false
        if (this.timerInterval && this.isPaused) {
            clearInterval(this.timerInterval)
        }
    }

    // Инициализация метода для сброса таймера
    resetTimer() {
        this.isPaused = false
        this.startTrigger = false
        clearInterval(this.timerInterval)
        if(this.getAttribute('seconds')) {
            this.formattedTime(this.seconds)
        } else if(this.time) {
            this.formattedTime(this.time)
        }
        this.numberDisplay()
    }
})