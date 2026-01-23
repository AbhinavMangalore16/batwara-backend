# Postman Testing Guide for Batwara Backend

This guide will help you test your backend APIs using Postman.

## Prerequisites

1. **Start your backend server:**
   ```bash
   bun run dev
   # or
   bun run start
   ```
   Your server should be running on `http://localhost:8000` (or the port specified in your `.env` file)

2. **Install Postman** (if not already installed)
   - Download from: https://www.postman.com/downloads/

## Base URL

```
http://localhost:8000
```

## Setting Up Postman Environment (Recommended)

1. Open Postman
2. Click on "Environments" in the left sidebar
3. Click "+" to create a new environment
4. Name it "Batwara Local"
5. Add these variables:
   - `base_url`: `http://localhost:8000`
   - `token`: (leave empty, will be set automatically after login)

6. Click "Save" and select this environment from the dropdown in the top right

## Authentication Flow

Your backend uses **Better Auth** for authentication. Here's how to authenticate:

### 1. Register a New User

**Request:**
- **Method:** `POST`
- **URL:** `{{base_url}}/api/auth/sign-up`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }
  ```

**Response:** You'll receive a session token in the response headers (usually as a cookie or in the response body).

### 2. Sign In (Login)

**Request:**
- **Method:** `POST`
- **URL:** `{{base_url}}/api/auth/sign-in`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

**Important:** After successful login, check the response headers for:
- **Set-Cookie** header containing the session token
- Or check the response body for a token

### 3. Extract and Use the Token

Better Auth typically uses cookies for session management. In Postman:

**Option A: Using Cookies (Recommended)**
1. After login, Postman automatically stores cookies
2. For subsequent requests, cookies are sent automatically
3. Make sure "Send cookies" is enabled in Postman settings

**Option B: Using Authorization Header**
If Better Auth provides a token in the response body:
1. Copy the token from the login response
2. Add it to your environment variable `token`
3. Use it in the Authorization header:
   ```
   Authorization: Bearer {{token}}
   ```

**Option C: Manual Cookie Setup**
1. After login, copy the cookie value from the response headers
2. In your protected requests, add a Cookie header:
   ```
   Cookie: better-auth.session_token=<your-token-here>
   ```

## Testing Endpoints

### Public Endpoints

#### 1. Health Check
- **Method:** `GET`
- **URL:** `{{base_url}}/`
- **Expected Response:** `Hello World!`

### Protected Endpoints (Require Authentication)

All protected endpoints require authentication. Make sure you're logged in and cookies/tokens are being sent.

#### User Endpoints

##### 1. Get Current User Details
- **Method:** `GET`
- **URL:** `{{base_url}}/api/users/me`
- **Headers:**
  ```
  Cookie: better-auth.session_token=<your-token>
  ```
  OR
  ```
  Authorization: Bearer {{token}}
  ```

##### 2. Update User Details
- **Method:** `PATCH`
- **URL:** `{{base_url}}/api/users/me`
- **Headers:**
  ```
  Content-Type: application/json
  Cookie: better-auth.session_token=<your-token>
  ```
- **Body** (raw JSON):
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com"
  }
  ```

##### 3. Check User
- **Method:** `GET`
- **URL:** `{{base_url}}/api/users/check`
- **Headers:**
  ```
  Cookie: better-auth.session_token=<your-token>
  ```

##### 4. Add Friend
- **Method:** `POST`
- **URL:** `{{base_url}}/api/users/add`
- **Headers:**
  ```
  Content-Type: application/json
  Cookie: better-auth.session_token=<your-token>
  ```
- **Body** (raw JSON):
  ```json
  {
    "friendId": "friend-user-id-here"
  }
  ```

#### Expense Endpoints

##### 1. Make Bill
- **Method:** `POST`
- **URL:** `{{base_url}}/api/expenses/makeBill`
- **Headers:**
  ```
  Content-Type: application/json
  Cookie: better-auth.session_token=<your-token>
  ```
- **Body** (raw JSON):
  ```json
  {
    "amount": 100.50,
    "description": "Dinner",
    "splitType": "equal"
  }
  ```

## Creating a Postman Collection

1. Click "Collections" in the left sidebar
2. Click "+" to create a new collection
3. Name it "Batwara Backend API"
4. Add requests for each endpoint:
   - Right-click the collection → "Add Request"
   - Name each request appropriately
   - Set the method and URL
   - Add headers and body as needed

5. **Set Collection-Level Authorization:**
   - Click on the collection
   - Go to the "Authorization" tab
   - Select "Bearer Token" or "No Auth" (if using cookies)
   - Or use "Inherit auth from parent" if you set it at folder level

## Tips for Testing

1. **Enable Cookie Management:**
   - Go to Postman Settings (gear icon)
   - Under "General", ensure "Send cookies" is enabled

2. **Use Environment Variables:**
   - Use `{{base_url}}` instead of hardcoding URLs
   - Store tokens in environment variables for easy updates

3. **Test Authentication First:**
   - Always test login/register endpoints first
   - Verify cookies/tokens are being set correctly

4. **Check Response Status:**
   - 200: Success
   - 201: Created
   - 400: Bad Request (check your request body)
   - 401: Unauthorized (check your authentication)
   - 404: Not Found (check your URL)
   - 500: Server Error (check server logs)

5. **View Response Headers:**
   - After login, check the "Headers" tab in the response
   - Look for `Set-Cookie` header to get the session token

6. **Save Responses:**
   - Use Postman's "Save Response" feature to save example responses
   - Useful for documentation and debugging

## Troubleshooting

### Issue: Getting 401 Unauthorized
- **Solution:** Make sure you're logged in and cookies/tokens are being sent
- Check if the token has expired
- Verify the Authorization header format is correct

### Issue: CORS Errors
- **Solution:** Your backend already has CORS configured for `localhost:3000`
- If testing from Postman, CORS shouldn't be an issue (Postman doesn't enforce CORS)
- If you see CORS errors, check your backend CORS configuration

### Issue: Cookies Not Being Sent
- **Solution:** 
  - Enable cookie management in Postman settings
  - Manually add Cookie header if needed
  - Check if the domain matches (localhost:8000)

### Issue: Better Auth Routes Not Working
- **Solution:** Better Auth routes use the pattern `/api/auth/{*any}`
- Common Better Auth endpoints:
  - `/api/auth/sign-up` - Register
  - `/api/auth/sign-in` - Login
  - `/api/auth/sign-out` - Logout
  - `/api/auth/session` - Get current session
  - `/api/auth/user` - Get current user

## Quick Reference: Common Better Auth Endpoints

Based on Better Auth documentation, here are common endpoints you can test:

- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session
- `GET /api/auth/user` - Get current user info
- `PATCH /api/auth/user` - Update user info

Check the Better Auth documentation for the complete list of available endpoints.
