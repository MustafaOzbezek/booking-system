import api from './api'

export interface User {
    id: string
    name: string
    email: string
}

export async function login(email: string, password: string): Promise<User> {
    const res = await api.post('/auth/login', { email, password })
    const { user } = res.data
    localStorage.setItem('user', JSON.stringify(user))
    return user
}

export async function register(name: string, email: string, password: string): Promise<User> {
    const res = await api.post('/auth/register', { name, email, password })
    const { user } = res.data
    localStorage.setItem('user', JSON.stringify(user))
    return user
}

export async function logout() {
    try {
        await api.post('/auth/logout')
    } finally {
        localStorage.removeItem('user')
        window.location.href = '/login'
    }
}

export async function getMe(): Promise<User | null> {
    try {
        const res = await api.get('/auth/me')
        localStorage.setItem('user', JSON.stringify(res.data.user))
        return res.data.user
    } catch {
        localStorage.removeItem('user')
        return null
    }
}

export function getUser(): User | null {
    if (typeof window === 'undefined') return null
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
}