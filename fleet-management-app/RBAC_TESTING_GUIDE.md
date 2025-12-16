# Role-Based Access Control (RBAC) Testing Guide

This guide will help you verify that RBAC is working correctly across the entire Fleet Management System.

## 1. Prerequisites

Ensure all services are running and you have created the following users in Keycloak:

| Username | Password  | Role            |
|----------|-----------|-----------------|
| admin    | admin123  | `fleet-admin`   |
| employee | emp123    | `fleet-employee`|

---

## 2. Frontend Testing

### Test 1: Sidebar Visibility
1. **Login as `employee`**:
   - Verify you **CANNOT** see "User Management" in the sidebar.
   - Verify you **CAN** see "Dashboard", "Vehicles", "Drivers", etc.

2. **Login as `admin`**:
   - Verify you **CAN** see "User Management" in the sidebar (under "Administration" section).

### Test 2: Protected Routes
1. **Login as `employee`**:
   - Manually type `http://localhost:3000/users` in the browser URL bar.
   - **Expected Result:** You should be redirected back to `/dashboard`.

2. **Login as `admin`**:
   - Click "User Management".
   - **Expected Result:** The page loads successfully.

---

## 3. Backend API Testing

To test the backend, use **Postman**, **curl**, or the browser's **Network Tab** (F12).

### How to get a Token
1. Login to the frontend.
2. Open Developer Tools (F12) -> **Network**.
3. Filter by `Fetch/XHR`.
4. Refresh the page.
5. Click a request (e.g., `vehicles`).
6. Look at **Request Headers** -> `Authorization: Bearer <TOKEN>`.
7. Copy the `<TOKEN>`.

### Test 3: Vehicle Service (C#) - Port 5000
*Attempt to create a vehicle (Admin Only).*

**Request:**
```bash
curl -X POST http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2024,
    "licensePlate": "TEST-RBAC",
    "status": 0
  }'
```

*   **Token from `employee`**: Returns `403 Forbidden`
*   **Token from `admin`**: Returns `201 Created`

### Test 4: Driver Service (Java) - Port 6001
*Attempt to delete a driver (Admin Only).*

**Request:**
```bash
curl -X DELETE http://localhost:6001/api/drivers/1 \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

*   **Token from `employee`**: Returns `403 Forbidden`
*   **Token from `admin`**: Returns `200 OK` (or 404 if ID doesn't exist)

### Test 5: Maintenance Service (Python) - Port 5001
*Attempt to delete a maintenance item (Admin Only).*

**Request:**
```bash
curl -X DELETE http://localhost:5001/maintenance/1 \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

*   **Token from `employee`**: Returns `403 Forbidden` (`Insufficient permissions: fleet-admin role required`)
*   **Token from `admin`**: Returns `200 OK` (or 404 if not found)

---

## 4. Troubleshooting

**"I get 401 Unauthorized for everything"**
- Check if Keycloak is running.
- Ensure your `realm` name is correct (`fleet-management-app`).
- Check if your token has expired (log out and login again).

**"I get 403 Forbidden even as Admin"**
- Verify the user has the `fleet-admin` role in Keycloak.
- Decode your JWT token at [jwt.io](https://jwt.io) and check `realm_access.roles`. It should list `fleet-admin`.

**"I can access Admin routes as Employee"**
- Verify you implemented the backend checks (`[Authorize(Policy="AdminOnly")]`, `@require_role`, etc.).
- Ensure you restarted the backend services after applying code changes.

