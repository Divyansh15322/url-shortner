import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('snip_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('snip_token')
      localStorage.removeItem('snip_user')
    }
    return Promise.reject(err)
  }
)

export const auth = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
}

export const urls = {
  shorten: (data) => API.post('/shorten', data),
  list: () => API.get('/my-urls'),
  stats: () => API.get('/my-stats'),
  delete: (code) => API.delete(`/urls/${code}`),
}

export const health = {
  check: () => API.get('/health'),
}

export default API
