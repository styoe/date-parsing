import { describe, expect, test } from '@jest/globals'
import { parse, stringify, roundDate } from './index'

// Using an aux function to test equality since it is possible that 
// some ms will pass between comparison date creation and 
// function execution therefore changing the seconds value
const datesEqual = (d1: Date, d2: Date, equal=true) => {
    const diff = Math.abs(d1.getTime() - d2.getTime())
    const tolerance = 999 // Making it less than a second since the min unit is seconds, although it shouldnt be more than a few ms diff
    return equal ? diff <= tolerance : diff > tolerance
}

describe('Parse function', () => {
    test('It parses correctly all positive', () => {
        const eq = new Date()
        eq.setUTCFullYear(eq.getUTCFullYear() + 2)
        eq.setUTCMonth(eq.getUTCMonth() + 1)
        eq.setUTCDate(eq.getUTCDate() + 14)
        eq.setUTCDate(eq.getUTCDate() + 42)
        eq.setUTCHours(eq.getUTCHours() + 4)
        eq.setUTCMinutes(eq.getUTCMinutes() + 3)
        eq.setUTCSeconds(eq.getUTCSeconds() + 12)

        const parsed = parse('now+2y+1M+2w+42d+4h+3m+12s')
        expect(datesEqual(parsed, eq)).toBe(true)
    })

    test('It parses correctly all negative', () => {
        const eq = new Date()
        eq.setUTCFullYear(eq.getUTCFullYear() - 2)
        eq.setUTCMonth(eq.getUTCMonth() - 1)
        eq.setUTCDate(eq.getUTCDate() - 14)
        eq.setUTCDate(eq.getUTCDate() - 42)
        eq.setUTCHours(eq.getUTCHours() - 4)
        eq.setUTCMinutes(eq.getUTCMinutes() - 3)
        eq.setUTCSeconds(eq.getUTCSeconds() - 12)

        const parsed = parse('now-2y-1M-2w-42d-4h-3m-12s')
        expect(datesEqual(parsed, eq)).toBe(true)
    })

    test('It parses correctly mixed values', () => {
        const eq = new Date()
        eq.setUTCFullYear(eq.getUTCFullYear() - 2)
        eq.setUTCMonth(eq.getUTCMonth() + 1)
        eq.setUTCDate(eq.getUTCDate() - 14)
        eq.setUTCDate(eq.getUTCDate() + 42)
        eq.setUTCHours(eq.getUTCHours() - 4)
        eq.setUTCMinutes(eq.getUTCMinutes() + 3)
        eq.setUTCSeconds(eq.getUTCSeconds() - 12)

        const parsed = parse('now-2y+1M-2w+42d-4h+3m-12s')
        expect(datesEqual(parsed, eq)).toBe(true)
    })

    test('It parses years', () => {
        const eq = new Date()
        eq.setUTCFullYear(eq.getUTCFullYear() - 2)
        expect(datesEqual(parse('now-2y'), eq)).toBe(true)

        eq.setUTCFullYear(eq.getUTCFullYear() + 4)
        expect(datesEqual(parse('now+2y'), eq)).toBe(true)
    })

    test('It parses months', () => {
        const eq = new Date()
        eq.setUTCMonth(eq.getUTCMonth() - 2)
        expect(datesEqual(parse('now-2M'), eq)).toBe(true)

        eq.setUTCMonth(eq.getUTCMonth() + 4)
        expect(datesEqual(parse('now+2M'), eq)).toBe(true)
    })

    test('It parses weeks', () => {
        const eq = new Date()
        eq.setUTCDate(eq.getUTCDate() - 14)
        expect(datesEqual(parse('now-2w'), eq)).toBe(true)

        eq.setUTCDate(eq.getUTCDate() + 28)
        expect(datesEqual(parse('now+2w'), eq)).toBe(true)
    })

    test('It parses days', () => {
        const eq = new Date()
        eq.setUTCDate(eq.getUTCDate() - 2)
        expect(datesEqual(parse('now-2d'), eq)).toBe(true)

        eq.setUTCDate(eq.getUTCDate() + 4)
        expect(datesEqual(parse('now+2d'), eq)).toBe(true)
    })

    test('It parses hours', () => {
        const eq = new Date()
        eq.setUTCHours(eq.getUTCHours() - 2)
        expect(datesEqual(parse('now-2h'), eq)).toBe(true)

        eq.setUTCHours(eq.getUTCHours() + 4)
        expect(datesEqual(parse('now+2h'), eq)).toBe(true)
    })

    test('It parses minutes', () => {
        const eq = new Date()
        eq.setUTCMinutes(eq.getUTCMinutes() - 2)
        expect(datesEqual(parse('now-2m'), eq)).toBe(true)

        eq.setUTCMinutes(eq.getUTCMinutes() + 4)
        expect(datesEqual(parse('now+2m'), eq)).toBe(true)
    })

    test('It parses seconds', () => {
        const eq = new Date()
        eq.setUTCSeconds(eq.getUTCSeconds() - 2)
        expect(datesEqual(parse('now-2s'), eq)).toBe(true)

        eq.setUTCSeconds(eq.getUTCSeconds() + 4)
        expect(datesEqual(parse('now+2s'), eq)).toBe(true)
    })
})


describe('Parse function rounding', () => {
    test('It takes the rounding modifier after slash', () => {
        const d = new Date()
        d.setUTCDate(d.getUTCDate() + 1)
        d.setUTCHours(d.getUTCHours() + 12)
        d.setUTCHours(0)
        d.setUTCMinutes(0)
        d.setUTCSeconds(0)
        d.setUTCMilliseconds(0)

        expect(datesEqual(parse('now+1d/d'), d)).toBe(true)
    })

    test('It rounds year correctly', () => {
        const d = new Date()
        d.setUTCFullYear(2024)
        d.setUTCMonth(5)
        roundDate(d, 'y')
        expect(d.getUTCFullYear()).toBe(2024)

        d.setUTCMonth(6)
        roundDate(d, 'y')
        expect(d.getUTCFullYear()).toBe(2025)
    })

    test('It rounds the month correctly', () => {
        const d = new Date()
        d.setUTCFullYear(2024)
        d.setUTCMonth(6)
        d.setUTCDate(15)
        roundDate(d, 'M')
        expect(d.getUTCMonth()).toBe(6)


        d.setUTCDate(16)
        d.setUTCHours(12)
        expect(d.getUTCMonth()).toBe(6)

        d.setUTCDate(16)
        d.setUTCHours(13)
        roundDate(d, 'M')
        expect(d.getUTCMonth()).toBe(7)
    })

    test('It rounds the week correctly', () => {
        const d = new Date()
        d.setUTCFullYear(2024)
        d.setUTCMonth(6)
        d.setUTCDate(15)
        roundDate(d, 'w')
        expect(d.getUTCDate()).toBe(15)

        d.setUTCDate(17)
        roundDate(d, 'w')
        expect(d.getUTCDate()).toBe(15)

        d.setUTCDate(18)
        roundDate(d, 'w')
        expect(d.getUTCDate()).toBe(22)
    })

    test('It rounds the day correctly', () => {
        const d = new Date()
        d.setUTCFullYear(2024)
        d.setUTCMonth(6)
        d.setUTCDate(15)
        d.setUTCHours(11)
        roundDate(d, 'd')
        expect(d.getUTCDate()).toBe(15)

        d.setUTCHours(13)
        roundDate(d, 'd')
        expect(d.getUTCDate()).toBe(16)
    })

    test('It rounds the hours correctly', () => {
        const d = new Date()
        d.setUTCFullYear(2024)
        d.setUTCMonth(6)
        d.setUTCDate(15)
        d.setUTCHours(1)
        d.setUTCMinutes(29)
        roundDate(d, 'h')
        expect(d.getUTCHours()).toBe(1)

        d.setUTCMinutes(30)
        roundDate(d, 'h')
        expect(d.getUTCHours()).toBe(2)
    })

    test('It rounds the minutes correctly', () => {
        const d = new Date()
        d.setUTCFullYear(2024)
        d.setUTCMonth(6)
        d.setUTCDate(15)
        d.setUTCHours(1)
        d.setUTCMinutes(30)
        d.setUTCSeconds(29)
        roundDate(d, 'm')
        expect(d.getUTCMinutes()).toBe(30)

        d.setUTCSeconds(31)
        roundDate(d, 'm')
        expect(d.getUTCMinutes()).toBe(31)
    })
})


describe('Parse function Input validation', () => {
    test('DateString starts with now', () => {
        expect(() => parse('tomorrow-2d+13s')).toThrow('DateString should start with "now"')
    })

    test('Phrase should start with operator', () => {
        expect(() => parse('now2m+13u')).toThrow('Unknown operator 2')
    })

    test('Malformed group', () => {
        expect(() => parse('now-2m+h')).toThrow('No number between operator + and modifier h')
    })

    test('Malformed group', () => {
        expect(() => parse('now-2m+sdah')).toThrow('No number between operator + and modifier s')
    })

    test('Unsupported modifiers', () => {
        expect(() => parse('now-2m+13u')).toThrow('Unsupported character u')
    })

    test('Unsupported modifiers', () => {
        expect(() => parse('now-2z+13u')).toThrow('Unsupported character z')
    })

    test('extra characters', () => {
        expect(() => parse('now-2h+13s+123')).toThrow('Extra characters in datestring: +123')
    })
})


describe('Stringify function', () => {

    test('It stringifies correctly just now', () => {
        const d = new Date()
        expect(stringify(d)).toBe('now')
    })

    test('It stringifies correctly all positive', () => {
        const d = new Date()

        d.setUTCFullYear(d.getUTCFullYear() + 2)
        d.setUTCMonth(d.getUTCMonth() + 14)
        d.setUTCDate(d.getUTCDate() + 24)
        d.setUTCHours(d.getUTCHours() + 4)
        d.setUTCMinutes(d.getUTCMinutes() + 3)
        d.setUTCSeconds(d.getUTCSeconds() + 12)

        expect(stringify(d)).toBe('now+3y+2M+3w+3d+4h+3m+12s')
    })

    test('It stringifies correctly all negative', () => {
        const d = new Date()

        d.setUTCFullYear(d.getUTCFullYear() - 2)
        d.setUTCMonth(d.getUTCMonth() - 14)
        d.setUTCDate(d.getUTCDate() - 24)
        d.setUTCHours(d.getUTCHours() - 4)
        d.setUTCMinutes(d.getUTCMinutes() - 3)
        d.setUTCSeconds(d.getUTCSeconds() - 12)

        expect(stringify(d)).toBe('now-3y-2M-3w-3d-4h-3m-12s')
    })

    test('It stringifies year', () => {
        const d = new Date()

        d.setUTCFullYear(d.getUTCFullYear() + 1)
        expect(stringify(d)).toBe('now+1y')

        d.setUTCFullYear(d.getUTCFullYear() - 2)
        expect(stringify(d)).toBe('now-1y')
    })

    test('It stringifies month', () => {
        const d = new Date()

        d.setUTCMonth(d.getUTCMonth() + 11)
        expect(stringify(d)).toBe('now+11M')

        d.setUTCMonth(d.getUTCMonth() + 1)
        expect(stringify(d)).toBe('now+1y')

        d.setUTCMonth(d.getUTCMonth() - 13)
        expect(stringify(d)).toBe('now-1M')

        d.setUTCMonth(d.getUTCMonth() - 11)
        expect(stringify(d)).toBe('now-1y')
    })

    test('It stringifies day', () => {
        const d = new Date()

        d.setUTCDate(d.getUTCDate() + 2)
        expect(stringify(d)).toBe('now+2d')

        d.setUTCDate(d.getUTCDate() + 18)
        expect(stringify(d)).toBe('now+2w+6d')

        d.setUTCDate(d.getUTCDate() - 22)
        expect(stringify(d)).toBe('now-2d')

        d.setUTCDate(d.getUTCDate() - 18)
        expect(stringify(d)).toBe('now-2w-6d')
    })

    test('It stringifies hour', () => {
        const d = new Date()

        d.setUTCHours(d.getUTCHours() + 2)
        expect(stringify(d)).toBe('now+2h')

        d.setUTCHours(d.getUTCHours() + 24)
        expect(stringify(d)).toBe('now+1d+2h')

        d.setUTCHours(d.getUTCHours() - 28)
        expect(stringify(d)).toBe('now-2h')

        d.setUTCHours(d.getUTCHours() - 24)
        expect(stringify(d)).toBe('now-1d-2h')
    })

    test('It stringifies minutes', () => {
        const d = new Date()

        d.setUTCMinutes(d.getUTCMinutes() + 2)
        expect(stringify(d)).toBe('now+2m')

        d.setUTCMinutes(d.getUTCMinutes() + 60)
        expect(stringify(d)).toBe('now+1h+2m')

        d.setUTCMinutes(d.getUTCMinutes() - 64)
        expect(stringify(d)).toBe('now-2m')

        d.setUTCMinutes(d.getUTCMinutes() - 60)
        expect(stringify(d)).toBe('now-1h-2m')
    })

    test('It stringifies seconds', () => {
        const d = new Date()

        d.setUTCSeconds(d.getUTCSeconds() + 2)
        expect(stringify(d)).toBe('now+2s')

        d.setUTCSeconds(d.getUTCSeconds() + 60)
        expect(stringify(d)).toBe('now+1m+2s')

        d.setUTCSeconds(d.getUTCSeconds() - 64)
        expect(stringify(d)).toBe('now-2s')

        d.setUTCSeconds(d.getUTCSeconds() - 60)
        expect(stringify(d)).toBe('now-1m-2s')
    })
})