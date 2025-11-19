# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

### Login
**POST** `/api/v1/auth/login`

Request body:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Using JWT Token
Include token in Authorization header:
```
Authorization: Bearer <token>
```

## Telemetry Endpoint

### Send Telemetry
**POST** `/api/v1/telemetry`

**Authentication:** API Key (X-API-Key header)

**Headers:**
```
Content-Type: application/json
X-API-Key: your-secret-api-key-here
```

**Request Body:**
```json
{
  "tree_id": 1,
  "timestamp": 1699999999,
  "temp_c": 24.3,
  "humidity_pct": 58.5,
  "mq2": 120,
  "mpu_accel_x": 0.01,
  "mpu_accel_y": 0.02,
  "mpu_accel_z": 0.98,
  "mpu_gyro_x": 0.1,
  "mpu_gyro_y": 0.2,
  "mpu_gyro_z": 0.0,
  "mpu_tilt": false,
  "mpu_cut_detected": false,
  "status": "ok"
}
```

**Response:**
```json
{
  "success": true,
  "telemetry_id": 123
}
```

## Tree Endpoints

### Get All Trees
**GET** `/api/v1/trees`

**Authentication:** JWT Token required

**Response:**
```json
[
  {
    "id": 1,
    "tree_id": 1,
    "species": "Apple",
    "planted_year": 2020,
    "notes": "Main orchard",
    "latitude": 41.3111,
    "longitude": 69.2797,
    "last_seen_at": "2024-01-15T10:30:00Z",
    "last_status": "ok"
  }
]
```

### Get Tree Details
**GET** `/api/v1/trees/:id`

**Authentication:** JWT Token required

**Query Parameters:**
- `limit`: Number of telemetry records (default: 100)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "id": 1,
  "tree_id": 1,
  "species": "Apple",
  "planted_year": 2020,
  "notes": "Main orchard",
  "telemetry": [...],
  "alerts": [...]
}
```

### Update Tree Metadata
**PUT** `/api/v1/trees/:id`

**Authentication:** JWT Token required

**Request Body:**
```json
{
  "species": "Apple",
  "planted_year": 2020,
  "notes": "Updated notes",
  "latitude": 41.3111,
  "longitude": 69.2797,
  "owner_contact": "+998901234567"
}
```

## Alert Endpoints

### Get Alerts
**GET** `/api/v1/alerts`

**Authentication:** JWT Token required

**Query Parameters:**
- `tree_id`: Filter by tree ID
- `acknowledged`: Filter by acknowledgment status (true/false)
- `limit`: Number of records (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "tree_id": 1,
    "type": "smoke",
    "level": "high",
    "message": "Smoke detected (MQ-2: 500)",
    "created_at": "2024-01-15T10:30:00Z",
    "acknowledged": false
  }
]
```

### Acknowledge Alert
**POST** `/api/v1/alerts/:id/acknowledge`

**Authentication:** JWT Token required

**Response:**
```json
{
  "id": 1,
  "acknowledged": true,
  "ack_at": "2024-01-15T11:00:00Z",
  "ack_by": 1
}
```

## WebSocket Events

### Connection
Connect to Socket.IO server at the same base URL.

**Authentication:** Include token in connection:
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});
```

### Events

#### `alert`
Emitted when a new alert is created.

```json
{
  "id": 1,
  "tree_id": 1,
  "type": "smoke",
  "level": "high",
  "message": "Smoke detected",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### `telemetry`
Emitted when new telemetry data is received.

```json
{
  "tree_id": 1,
  "timestamp": "2024-01-15T10:30:00Z",
  "temp_c": 24.3,
  "humidity_pct": 58.5,
  "mq2": 120,
  "status": "ok"
}
```

#### `alert_acknowledged`
Emitted when an alert is acknowledged.

```json
{
  "id": 1,
  "acknowledged": true
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

