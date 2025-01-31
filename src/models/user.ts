export interface User {
    id: number
    notification_target: {
        type: number
    }
}

export const validateEmail = (email: string) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
}

export const validatePassword = (password: string) => {
    return password.length >= 8
}