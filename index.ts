
interface DateString extends String {}

const modifiers = ['', 'y', 'M', 'w', 'd', 'h', 'm', 's'] as const
type Modifier = typeof modifiers[number]

// TODO: Depending on the usage we could benefit from caching this
function getDaysInMonth (month: number, year: number) {
    return new Date(year, month, 0).getDate()
}

export const roundDate = (d: Date, rounding: Modifier): Date => {
    if(rounding === "y") {
        d.setUTCMonth(d.getUTCMonth() + 6)
        d.setUTCMonth(0)
        d.setUTCDate(1)
        d.setUTCHours(0)
        d.setUTCMinutes(0)
        d.setUTCSeconds(0)
        d.setUTCMilliseconds(0)
        return d
    }

    if(rounding === "M") {
        d.setUTCDate(d.getUTCDate() + Math.round(getDaysInMonth(d.getUTCMonth(), d.getUTCFullYear())/2))
        d.setUTCHours(d.getUTCHours() + 12)
        d.setUTCDate(1)
        d.setUTCHours(0)
        d.setUTCMinutes(0)
        d.setUTCSeconds(0)
        d.setUTCMilliseconds(0)
        return d
    }

    // Rounding to closest monday
    if(rounding === "w") {
        let weekday = d.getDay()
        let mod = weekday === 0 ? 1 : weekday < 4 ? 1-weekday : 8 - weekday 
        d.setUTCDate(d.getUTCDate() + mod)
        d.setUTCHours(0)
        d.setUTCMinutes(0)
        d.setUTCSeconds(0)
        d.setUTCMilliseconds(0)
        return d
    }

    if(rounding === "d") {
        d.setUTCHours(d.getUTCHours() + 12)
        d.setUTCHours(0)
        d.setUTCMinutes(0)
        d.setUTCSeconds(0)
        d.setUTCMilliseconds(0)
        return d
    }

    if(rounding === "h") { 
        d.setUTCMinutes(d.getUTCMinutes() + 30)
        d.setUTCMinutes(0)
        d.setUTCSeconds(0)
        d.setUTCMilliseconds(0)
        return d
    }

    if(rounding === "m") {
        d.setUTCSeconds(d.getUTCSeconds() + 30)
        d.setUTCSeconds(0)
        d.setUTCMilliseconds(0)
        return d
    }

    return d
}

const modifyDate = (d: Date, operator: string, number: string, modifier: Modifier): Date => {
    const nr = (operator === "+" ? 1 : -1) * parseInt(number)

    if(modifier==="y") {
        d.setUTCFullYear(d.getUTCFullYear() + nr)
    } else if(modifier==="M") {
        d.setUTCMonth(d.getUTCMonth() + nr)
    } else if(modifier==="w") {
        d.setUTCDate(d.getUTCDate() + nr*7)
    } else if(modifier==="d") {
        d.setUTCDate(d.getUTCDate() + nr)
    } else if(modifier==="h") {
        d.setUTCHours(d.getUTCHours() + nr)
    } else if(modifier==="m") {
        d.setUTCMinutes(d.getUTCMinutes() + nr)
    } else if(modifier==="s") {
        d.setUTCSeconds(d.getUTCSeconds() + nr)
    }

    return d
}


export const parse = (datestring: DateString): Date => {
    // Remove and check now
    if(!datestring.startsWith("now")) throw new Error('DateString should start with "now"')
    let l = 3
    let r = datestring.length-1
    
    // Set and check rounding if any
    let rounding: Modifier  = ""
    if(datestring[datestring.length - 2] == "/") {
        rounding = datestring[r] as Modifier
        r -= 2
        if(!modifiers.includes(rounding as Modifier)) throw new Error(`Unknown rounding modifier ${rounding}`)
    }

    const d = new Date()

    let operator = ""
    let number = ""
    let modifier: Modifier = ""

    for(let i=l; i<=r; i++) {
        if(!operator) {
            if(datestring[i] !== "+" && datestring[i] !== "-") throw new Error(`Unknown operator ${datestring[i]}`) 
            operator = datestring[i]
            continue
        }

        // Cast to any since isNaN works on strings too
        if(!isNaN(datestring[i] as any)) {
            number += datestring[i]
            continue
        }

        if(!modifiers.includes(datestring[i] as Modifier)) {
            throw new Error(`Unsupported character ${datestring[i]}`) 
        }
        modifier = datestring[i] as Modifier

        if(!number) {
            throw new Error(`No number between operator ${operator} and modifier ${modifier}`) 
        }

        if(operator && number && modifier) {
            modifyDate(d, operator, number, modifier)
            operator = ""
            number = ""
            modifier = ""
        }
    }

    if(operator || number || modifier) {
        throw new Error(`Extra characters in datestring: ${operator}${number}${modifier}`)
    }

    if(rounding) roundDate(d, rounding)

    return d
}


const getStringifyGroup = (v: number, modifier: string) => {
    if(v === 0) return ''

    let prefix = v > 0 ? '+' : ''
    return `${prefix}${v}${modifier}`
}


export const stringify = (date: Date): DateString => {
    const now = new Date()
    
    // Get values
    const nowTime = now.getTime()
    const dateTime = date.getTime()

    const op = nowTime > dateTime ? -1 : 1
    let delta = Math.round(Math.abs(nowTime - dateTime) / 1000)

    // Get days
    let days = Math.round(Math.floor(delta / 86400))
    delta -= days * 86400

    // Get hours
    const hours = Math.round(Math.floor(delta / 3600) % 24)
    delta -= hours * 3600

    // Get minutes
    const minutes = Math.round(Math.floor(delta / 60) % 60)
    delta -= minutes * 60

    // Get seconds
    const seconds = Math.round(delta % 60)

    // Get months from days
    let currYear = now.getUTCFullYear()
    let currMonth = now.getUTCMonth()
    
    let months = 0
    let years = 0

    while(true) {
        let dm = getDaysInMonth(currMonth + (op > 0 ? 1 : 0), currYear)

        if(Math.abs(days) >= dm) {
            days -= dm
            months += 1
            currMonth += op * 1

            if(currMonth < 0 ) {
                currYear -= 1
                currMonth = 11
            }

            if(currMonth > 11) {
                currYear += 1
                currMonth = 0
            }

            continue
        }

        break
    }

    // Get years from months
    if(months >= 12) {
        years = Math.floor(months / 12)
        months = months % 12
    }

    // Get weeks from remaining days
    let weeks = 0
    if(days >= 7) {
        weeks = Math.floor(days / 7)
        days = days % 7
    }

    // Construct result
    let res = "now"

    res += getStringifyGroup(op * years, 'y')
    res += getStringifyGroup(op * months, 'M')
    res += getStringifyGroup(op * weeks, 'w')
    res += getStringifyGroup(op * days, 'd')
    res += getStringifyGroup(op * hours, 'h')
    res += getStringifyGroup(op * minutes, 'm')
    res += getStringifyGroup(op * seconds, 's')

    return res
}
