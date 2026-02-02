import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// API functions
export const contentApi = {
    generate: async (data: {
        idea: string
        platform?: string
        count?: number
        tone?: string
        generate_designs?: boolean
        design_style?: string
    }) => {
        const response = await api.post('/content/generate', data)
        return response.data
    },

    generateReels: async (data: {
        idea: string
        count?: number
        duration?: string
        tone?: string
    }) => {
        const response = await api.post('/content/reels/scripts', data)
        return response.data
    },

    generateHashtags: async (data: {
        content: string
        platform?: string
        niche?: string
        count?: number
    }) => {
        const response = await api.post('/content/hashtags', data)
        return response.data
    },

    getAll: async (params?: {
        skip?: number
        limit?: number
        platform?: string
        content_type?: string
    }) => {
        const response = await api.get('/content/', { params })
        return response.data
    },

    getById: async (id: number) => {
        const response = await api.get(`/content/${id}`)
        return response.data
    },

    delete: async (id: number) => {
        const response = await api.delete(`/content/${id}`)
        return response.data
    },
}

export const authApi = {
    register: async (data: {
        email: string
        username: string
        password: string
        full_name?: string
    }) => {
        const response = await api.post('/auth/register', data)
        return response.data
    },

    login: async (data: { email: string; password: string }) => {
        const response = await api.post('/auth/login', data)
        return response.data
    },

    getCurrentUser: async (token: string) => {
        const response = await api.get('/auth/me', {
            params: { token },
        })
        return response.data
    },
}

export const brandApi = {
    create: async (data: any) => {
        const response = await api.post('/brands/', data)
        return response.data
    },

    getAll: async () => {
        const response = await api.get('/brands/')
        return response.data
    },

    getById: async (id: number) => {
        const response = await api.get(`/brands/${id}`)
        return response.data
    },

    update: async (id: number, data: any) => {
        const response = await api.put(`/brands/${id}`, data)
        return response.data
    },

    delete: async (id: number) => {
        const response = await api.delete(`/brands/${id}`)
        return response.data
    },
}
