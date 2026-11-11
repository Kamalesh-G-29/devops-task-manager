
import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const registerUser = async (user) =>
  (await API.post('/auth/register', user)).data

export const loginUser = async (user) =>
  (await API.post('/auth/login', user)).data

export const getTasks = async () =>
  (await API.get('/tasks')).data.data

export const createTask = async (task) =>
  (await API.post('/tasks', task)).data.data

export const updateTask = async (id, task) =>
  (await API.put(`/tasks/${id}`, task)).data.data

export const deleteTask = async (id) =>
  (await API.delete(`/tasks/${id}`)).data

export default API
