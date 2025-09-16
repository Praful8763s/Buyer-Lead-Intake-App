import { authApi } from './api'

export interface User {
  id: string
  email: string
  full_name: string
}

export const auth = {
  async demoLogin(): Promise<{ token: string; user: User }> {
    const response = await authApi.demoLogin()
    return response.data
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await authApi.login(email, password)
    return response.data
  },

  async getProfile(): Promise<User> {
    const response = await authApi.profile()
    return response.data
  },

  setToken(token: string) {
    localStorage.setItem('token', token)
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  removeToken() {
    localStorage.removeItem('token')
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}