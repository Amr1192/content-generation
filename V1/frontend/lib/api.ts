import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
    baseURL: API_URL,
    timeout: 120000,
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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            error.userMessage = 'Request timed out. Check backend server and DB connection.'
        } else if (!error.response) {
            error.userMessage = 'Cannot reach backend API. Make sure backend is running on http://localhost:8000.'
        } else if (typeof error.response?.data?.detail === 'string') {
            error.userMessage = error.response.data.detail
        }

        return Promise.reject(error)
    }
)

// API functions
export const contentApi = {
    generate: async (data: {
        idea: string
        image_instructions?: string
        platform?: string
        count?: number
        tone?: string
        generate_designs?: boolean
        generate_images?: boolean
        image_mode?: 'ai' | 'template'
        image_count?: number
        image_style?: string
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

    update: async (
        id: number,
        data: {
            generated_text?: string
            caption?: string
            hashtags?: string[]
            status?: string
        }
    ) => {
        const response = await api.put(`/content/${id}`, data)
        return response.data
    },

    delete: async (id: number) => {
        const response = await api.delete(`/content/${id}`)
        return response.data
    },

    generateImages: async (
        id: number,
        data: {
            count?: number
            image_mode?: 'ai' | 'template'
            image_style?: string
            design_style?: string
            image_instructions?: string
        }
    ) => {
        const response = await api.post(`/content/${id}/images/generate`, data)
        return response.data
    },

    uploadImages: async (id: number, files: File[]) => {
        const formData = new FormData()
        for (const file of files) {
            formData.append('files', file)
        }
        const response = await api.post(`/content/${id}/images/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return response.data
    },

    deleteImage: async (id: number, imageId: number) => {
        const response = await api.delete(`/content/${id}/images/${imageId}`)
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

export const socialApi = {
    getPlatforms: async () => {
        const response = await api.get('/social/platforms')
        return response.data
    },

    getAccounts: async () => {
        const response = await api.get('/social/accounts')
        return response.data
    },

    connectAccount: async (data: {
        platform: string
        account_handle?: string
        access_token?: string
        refresh_token?: string
    }) => {
        const response = await api.post('/social/accounts/connect', data)
        return response.data
    },

    disconnectAccount: async (platform: string) => {
        const response = await api.delete(`/social/accounts/${platform}`)
        return response.data
    },

    startOAuth: async (platform: string) => {
        const response = await api.get(`/social/oauth/${platform}/start`)
        return response.data
    },

    sharePost: async (contentId: number, platforms?: string[]) => {
        const response = await api.post(`/social/share/${contentId}`, { platforms })
        return response.data
    },

    shareBulk: async (data: { content_ids?: number[]; platforms?: string[] }) => {
        const response = await api.post('/social/share/bulk', data)
        return response.data
    },

    publishPost: async (contentId: number, platforms?: string[]) => {
        const response = await api.post(`/social/publish/${contentId}`, { platforms })
        return response.data
    },

    publishBulk: async (data: { content_ids?: number[]; platforms?: string[] }) => {
        const response = await api.post('/social/publish/bulk', data)
        return response.data
    },
}
