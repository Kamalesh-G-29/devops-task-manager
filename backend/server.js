const authRoutes = require('./routes/authRoutes')
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')
const taskRoutes = require('./routes/taskRoutes')

const app = express()

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}))

app.use(express.json())

// Health API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DevOps Task Manager API is running!',
    status: 'Healthy'
  })
})

// Root API
app.get('/', (req, res) => {
  res.send('Welcome to DevOps Task Manager Backend')
})

// Task CRUD API
app.use('/api/tasks', taskRoutes)

// Start server after MongoDB connects
const startServer = async () => {
  try {
    await connectDB()

    const PORT = process.env.PORT || 5000

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}
app.use('/api/auth', authRoutes)
startServer()
