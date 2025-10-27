# BiteSpeed

This is a **Node.js + TypeScript backend** for the BiteSpeed Identity Reconciliation task. It consolidates customer contacts (email and phoneNumber) across multiple purchases, linking primary and secondary contacts in a PostgreSQL database using **Prisma ORM**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Database](#database)
- [API](#api)
- [Project Structure](#project-structure)
- [License](#license)

---

## Features

- **Identify endpoint**: `/identify`

  - Accepts email and/or phoneNumber in JSON body
  - Consolidates multiple contacts into a single identity
  - Marks the oldest contact as **primary** and others as **secondary**
  - Returns a structured JSON response with all linked emails, phoneNumbers, and secondary IDs

- Automatic linking of multiple contacts based on email/phone

- Handles creation of new primary or secondary contacts

---

## Tech Stack

- **Backend:** Node.js + TypeScript + Express
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Hosting:** Render

---

## Setup

1. **Clone the repository**

```bash
git clone https://github.com/Uttam1119/biteSpeed
cd biteSpeed
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**
   Create a `.env` file in the root:

```
DB_URI="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
PORT=3000
```

4. **Run Prisma migrations**

```bash
npx prisma migrate dev --name init
```

5. **Start the development server**

```bash
npm run dev
```

The server will start on `http://localhost:3000`.

---

## Database

**Contact table:**

| Column         | Type                | Description                            |                                        |
| -------------- | ------------------- | -------------------------------------- | -------------------------------------- |
| id             | Int (PK)            | Unique identifier                      |                                        |
| email          | String (nullable)   | Customer email                         |                                        |
| phoneNumber    | String (nullable)   | Customer phone number                  |                                        |
| linkedId       | Int (nullable)      | Points to primary contact if secondary |                                        |
| linkPrecedence | "primary"           | "secondary"                            | Indicates primary or secondary contact |
| createdAt      | DateTime            | Record creation timestamp              |                                        |
| updatedAt      | DateTime            | Record update timestamp                |                                        |
| deletedAt      | DateTime (nullable) | Soft delete timestamp                  |                                        |

---

## API

### **POST /identify**

**Request Body**

```json
{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456"
}
```

**Response**

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

- If no existing contact is found, a new **primary contact** is created.
- If a contact exists with matching email or phoneNumber, it links new info as **secondary**.

---

## Project Structure

```
bitespeed/
│
├─ src/
│  ├─ routes/
│  │  └─ identify.ts
│  ├─ app.ts
│  ├─ db.ts
│  ├─ index.ts
│  ├─ prismaClient.ts
|  └─ utils.ts
│
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
│
├─ package.json
├─ tsconfig.json
└─ README.md
```
