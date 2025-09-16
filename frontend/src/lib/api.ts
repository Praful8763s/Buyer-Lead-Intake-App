import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Handle API errors and provide better error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    
    // Add more detailed error information
    if (error.response) {
      // Server responded with error status
      error.message = `Server Error (${error.response.status}): ${
        error.response.data?.message || 
        error.response.data?.detail || 
        error.response.statusText
      }`
    } else if (error.request) {
      // Request was made but no response received
      error.message = 'Network Error: Unable to connect to server. Please check if the backend is running.'
    } else {
      // Something else happened
      error.message = `Request Error: ${error.message}`
    }
    
    return Promise.reject(error)
  }
)

export const authApi = {
  demoLogin: () => api.post('/auth/demo-login/'),
  login: (email: string, password: string) => 
    api.post('/auth/login/', { email, password }),
  profile: () => api.get('/auth/profile/'),
}

export const buyersApi = {
  list: (params?: any) => api.get('/leads/buyers/', { params }),
  create: (data: any) => api.post('/leads/buyers/', data),
  get: (id: string) => api.get(`/leads/buyers/${id}/`),
  update: (id: string, data: any) => api.put(`/leads/buyers/${id}/`, data),
  delete: (id: string) => api.delete(`/leads/buyers/${id}/`),
  history: (id: string) => api.get(`/leads/buyers/${id}/history/`),
  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/leads/import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  export: (params?: any) => api.get('/leads/export/', { 
    params,
    responseType: 'blob'
  }),
  downloadTemplate: () => api.get('/leads/template/', {
    responseType: 'blob'
  }),
  getStats: () => api.get('/leads/stats/'),
  getAnalytics: (days?: number) => api.get('/leads/analytics/', { 
    params: days ? { days } : {} 
  }),
  getTrends: () => api.get('/leads/analytics/trends/'),
  getConversion: (days?: number) => api.get('/leads/analytics/conversion/', { 
    params: days ? { days } : {} 
  }),
}