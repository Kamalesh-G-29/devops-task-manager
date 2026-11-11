
const request = require('supertest')

const API = 'http://127.0.0.1:5000'

describe('DevOps Task Manager API Tests', () => {
  let token
  let taskId

  const testUser = {
    name: 'Jest Test User',
    email: `jest${Date.now()}@example.com`,
    password: 'Test@12345'
  }

  const auth = () => ({
    Authorization: `Bearer ${token}`
  })

  test('Register a new user', async () => {
    const response = await request(API)
      .post('/api/auth/register')
      .send(testUser)

    expect(response.statusCode).toBe(201)
    expect(response.body.success).toBe(true)
  })

  test('Login user and receive JWT token', async () => {
    const response = await request(API)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.token).toBeDefined()

    token = response.body.token
  })

  test('Reject task access without token', async () => {
    const response = await request(API)
      .get('/api/tasks')

    expect(response.statusCode).toBe(401)
  })

  test('Create a task', async () => {
    const response = await request(API)
      .post('/api/tasks')
      .set(auth())
      .send({
        title: 'Automated Testing',
        description: 'Testing task creation',
        status: 'Pending',
        priority: 'High'
      })

    expect(response.statusCode).toBe(201)
    expect(response.body.success).toBe(true)

    taskId = response.body.data._id
  })

  test('Get user tasks', async () => {
    const response = await request(API)
      .get('/api/tasks')
      .set(auth())

    expect(response.statusCode).toBe(200)
    expect(response.body.count).toBeGreaterThan(0)
  })

  test('Update task', async () => {
    const response = await request(API)
      .put(`/api/tasks/${taskId}`)
      .set(auth())
      .send({ status: 'Completed' })

    expect(response.statusCode).toBe(200)
    expect(response.body.data.status).toBe('Completed')
  })

  test('Delete task', async () => {
    const response = await request(API)
      .delete(`/api/tasks/${taskId}`)
      .set(auth())

    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
