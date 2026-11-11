
const API_URL = 'http://localhost:5000/api/tasks'

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  const result = await response.json()

  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'API request failed')
  }

  return result
}

// Get all tasks
export const getTasks = async () => {
  const result = await request(API_URL)
  return result.data
}

// Create a task
export const createTask = async (task) => {
  const result = await request(API_URL, {
    method: 'POST',
    body: JSON.stringify(task)
  })

  return result.data
}

// Update a task
export const updateTask = async (id, task) => {
  const result = await request(`${API_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(task)
  })

  return result.data
}

// Delete a task
export const deleteTask = async (id) => {
  return request(`${API_URL}/${id}`, {
    method: 'DELETE'
  })
}
