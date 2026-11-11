# API Documentation

Base URL: http://localhost:5000/api

## Health
GET /health

## Authentication
POST /auth/register
POST /auth/login

## Tasks
GET /tasks
GET /tasks/:id
POST /tasks
PUT /tasks/:id
DELETE /tasks/:id

## Task Fields
- title
- description
- status
- priority
- dueDate
- userId

All protected task endpoints require authentication.
