# Top Ten Tea API Documentation

Base URL: `http://localhost:5000` (or your deployed domain)

## Authentication (`/auth`)

### 1. Register User
- **POST** `/auth/register`
- **Body:** `{ "name", "email", "password", "role" }` (role can be `"admin"` or `"delivery"`)

### 2. Login User
- **POST** `/auth/login`
- **Body:** `{ "email", "password" }`
- **Response:** `{ "token", "user": { "_id", "name", "email", "role" } }`

---

## Admin Flow (`/admin`)
*Requires Admin Token in Authorization Header.*

### Products

#### 1. Get All Products
- **GET** `/admin/products`

#### 2. Create Product
- **POST** `/admin/products`
- **Body:** `{ "name", "productCode", "price", "netQuantity", "incentivePerPiece" }`

#### 3. Update Product
- **PUT** `/admin/products/:id`
- **Body:** Update specific fields.

#### 4. Delete Product
- **DELETE** `/admin/products/:id`

### Stores

#### 1. Get All Stores
- **GET** `/admin/stores`

#### 2. Get Unique Store Groups
- **GET** `/admin/stores/groups`
- **Description:** Returns an array of group names.

#### 3. Create Store
- **POST** `/admin/stores`
- **Body:** `{ "name", "storeId", "groupName", "areaName", "address", "contactNo", "message" }`

#### 4. Update / Delete Store
- **PUT** `/admin/stores/:id`
- **DELETE** `/admin/stores/:id`

### Users Management (Delivery Staff)

#### 1. Get All Users
- **GET** `/admin/users`

#### 2. Create / Update / Delete User
- **POST** `/admin/users`
- **PUT** `/admin/users/:id`
- **DELETE** `/admin/users/:id`

### Assignments

#### 1. Get All Assignments
- **GET** `/admin/assignments`

#### 2. Assign Product to Delivery Person
- **POST** `/admin/assignments`
- **Body:**
```json
{
  "userId": "65f...",
  "assignments": [
    { "productId": "65d...", "groupName": "North", "quantity": 100 }
  ]
}
```

#### 3. Update Assignment
- **PUT** `/admin/assignments/:id`
- **PATCH** `/admin/assignments/:id`
- **Body:** `{ "assignedQuantity", "groupName" }` etc.

#### 4. Delete Assignment
- **DELETE** `/admin/assignments/:id`

### Tracking & Settlement

#### 1. Get Daily Tracking Summary
- **GET** `/admin/tracking?date=YYYY-MM-DD`
- **Description:** Aggregates total sales, quantity, and incentives for all users on a given date (defaults to today).

#### 2. Get Settlement Details (For pop-up Matrix)
- **GET** `/admin/tracking/settlement/:deliveryPersonId?date=YYYY-MM-DD`
- **Response Data:**
```json
{
  "totalAssignedQuantity": 200,
  "totalQuantitySold": 150,
  "unsoldQuantity": 50,
  "totalSalesAmount": 15000,
  "totalIncentive": 1500,
  "visitedStoresCount": 15,
  "unvisitedStoresCount": 5,
  "unvisitedStores": [ /* Store Objects */ ],
  "sales": [ /* Sale Objects */ ]
}
```

#### 3. Submit Final Settlement
- **POST** `/admin/settlements`
- **Body:**
```json
{
  "deliveryPersonId": "65f...",
  "date": "2024-03-12",
  "totalSalesAmount": 15000,
  "totalIncentive": 1500,
  "petrolAllowance": 500
}
```
*Note: Backend automatically calculates `finalTotal`.*

---

## Delivery Flow (`/delivery`)
*Requires Delivery Token in Authorization Header.*

### 1. Get Today's Assigned Products
- **GET** `/delivery/assigned-products`
- **Description:** Returns assignments for the logged-in delivery person, created on the current calendar day.

### 2. Create Sale
- **POST** `/delivery/sales`
- **Body:**
```json
{
  "storeId": "65e...", // OR
  "customStoreName": "New Store XYZ",
  "address": "Optional", // Required for custom store
  "contactNo": "Optional", // Required for custom store
  "items": [
    {
      "productId": "65d...",
      "quantity": 10,
      "amount": 5000,
      "pricePerUnit": 500
    }
  ]
}
```

### 3. Get My Sales History
- **GET** `/delivery/sales`
- **Description:** Returns sales filtered for the logged-in user, grouped by `billId`.
