# Gym Management Backend - Spring Boot

This is the Spring Boot backend for the Gym Management System, replacing the Firebase backend.

## Features

- JWT-based authentication
- Member management
- Plan management
- Transaction tracking
- Financial summaries
- Attendance tracking

## Technology Stack

- Spring Boot 3.2.0
- Spring Security with JWT
- Spring Data JPA
- MySQL Database
- Maven

## Setup Instructions

1. **Prerequisites**
   - Java 17 or higher
   - Maven 3.6+
   - MySQL 8.0+

2. **Database Setup**
   - Create a MySQL database named `gym_management`
   - Update database credentials in `application.properties`:
     ```properties
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     ```

3. **Build and Run**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

4. **API Base URL**
   - The application runs on `http://localhost:8080`
   - API endpoints are prefixed with `/api`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Members
- `POST /api/members` - Create a new member (requires authentication)
- `GET /api/members` - Get all members (requires authentication)
- `GET /api/members/{id}` - Get member by ID (requires authentication)
- `DELETE /api/members/{id}` - Delete a member (requires authentication)

### Plans
- `POST /api/plans` - Create a new plan (requires authentication)
- `GET /api/plans` - Get all plans (requires authentication)
- `PUT /api/plans/{id}` - Update a plan (requires authentication)
- `DELETE /api/plans/{id}` - Delete a plan (requires authentication)

## Authentication

All endpoints except `/api/auth/**` require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Notes

1. Email verification is currently handled in the database. You may want to implement actual email verification in production.
2. Financial summary updates use simplified JSON storage. Consider using proper JSON columns or separate tables for production.
3. Update the JWT secret in `application.properties` for production use.
4. CORS is currently set to allow all origins. Configure it properly for production.

## Next Steps

1. Implement more endpoints for:
   - Transactions
   - Attendance
   - Financial summaries
   - QR code generation
2. Add email verification service
3. Implement proper error handling
4. Add logging
5. Add unit and integration tests
