import moment from "moment"
import { Label } from "./label"
import { ColorPaletteProp } from "@mui/joy"
import { dayOfMonthSuffix } from "../utils/date"

export interface FrequencyMetadata {
    unit: string
    time: string
    days?: string[]
    months?: string[]
}

export interface Task {
    id: string
    title: string
    description: string
    nextDueDate: string
    frequency: number
    frequencyType: string
    frequencyMetadata: string
    labels: Label[]
    isArchived: boolean
    updatedAt: string
}

export type TaskGroup = {
    name: string
    content: Task[]
    color?: string
}

export const getDueDateChipText = (nextDueDate: string): string => {
    if (nextDueDate === null) {
        return 'No Due Date'
    }

    // if due in next 48 hours, we should it in this format : Tomorrow 11:00 AM
    const diff = moment(nextDueDate).diff(moment(), 'hours')
    if (diff < 48 && diff > 0) {
        return moment(nextDueDate).calendar().replace(' at', '')
    }

    return 'Due ' + moment(nextDueDate).fromNow()
}

export const getDueDateChipColor = (nextDueDate: string): ColorPaletteProp => {
    if (nextDueDate === null) {
        return 'neutral'
    }

    const diff = moment(nextDueDate).diff(moment(), 'hours')
    if (diff < 48 && diff > 0) {
        return 'warning'
    }

    if (diff < 0) {
        return 'danger'
    }

    return 'neutral'
}

export const getRecurrentChipText = (task: Task) => {
    if (task.frequencyType === 'once') {
        return 'Once'
    } else if (task.frequencyType === 'trigger') {
        return 'Trigger'
    } else if (task.frequencyType === 'daily') {
        return 'Daily'
    } else if (task.frequencyType === 'adaptive') {
        return 'Adaptive'
    } else if (task.frequencyType === 'weekly') {
        return 'Weekly'
    } else if (task.frequencyType === 'monthly') {
        return 'Monthly'
    } else if (task.frequencyType === 'yearly') {
        return 'Yearly'
    } else if (task.frequencyType === 'days_of_the_week') {
        let days = JSON.parse(task.frequencyMetadata).days
        if (days.length > 4) {
        const allDays = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ]
        const selectedDays = days.map((d: string) => moment().day(d).format('dddd'))
        const notSelectedDay = allDays.filter(
            day => !selectedDays.includes(day),
        )
        const notSelectedShortdays = notSelectedDay.map(d =>
            moment().day(d).format('ddd'),
        )
        return `Daily except ${notSelectedShortdays.join(', ')}`
        } else {
        days = days.map((d: string) => moment().day(d).format('ddd'))
        return days.join(', ')
        }
    } else if (task.frequencyType === 'day_of_the_month') {
        const months = JSON.parse(task.frequencyMetadata).months
        if (months.length > 6) {
            const allMonths = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ]
            const selectedMonths = months.map((m: string) => moment().month(m).format('MMMM'))
            const notSelectedMonth = allMonths.filter(
                month => !selectedMonths.includes(month),
            )
            const notSelectedShortMonths = notSelectedMonth.map(m =>
                moment().month(m).format('MMM'),
            )
            return `${task.frequency}${dayOfMonthSuffix(
                task.frequency,
            )} except ${notSelectedShortMonths.join(', ')}`
        } else {
            const freqData = JSON.parse(task.frequencyMetadata)
            const months = freqData.months.map((m: string) => moment().month(m).format('MMM'))
            return `${task.frequency}${dayOfMonthSuffix(
                task.frequency,
            )} of ${months.join(', ')}`
        }
    } else if (task.frequencyType === 'interval') {
        return `Every ${task.frequency} ${
        JSON.parse(task.frequencyMetadata).unit
        }`
    } else {
        return task.frequencyType
    }
}
