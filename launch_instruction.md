# Mesael Finance Platform - Launch Instructions

Follow these steps to launch the Mesael Finance enterprise application locally on your machine.

## Prerequisites
- **Node.js** (v18 or higher recommended)
- **Docker Desktop** (must be running on your machine)

---

## Step 1: Start the Database
The application relies on a robust PostgreSQL database.

1. Open a terminal in the root of the project (`c:\Users\blu\Desktop\Mesael Finance`).
2. Run the following command to spin up the database container in the background:
   ```bash
   docker-compose up -d
   ```
   *(Note: The database runs on port `5433` to avoid conflicts with other local Postgres instances).*

---

## Step 2: Start the Next.js Application
Once the database is running, you can start the application frontend and backend routes.

1. In the same terminal, ensure your dependencies are up to date:
   ```bash
   npm install
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   **[http://localhost:3000](http://localhost:3000)**

---

## Step 3: Test Accounts (Credentials)
Because we have implemented a secure NextAuth layer, you must log in to access the system. Use the following corporate emails to test different roles. 

**Universal Password for all demo accounts:** `1234`

| Persona | Email | Role |
| :--- | :--- | :--- |
| **Leta** | `leta@mesael.et` | Operational Finance (Creates Vouchers) |
| **Dembi** | `dembi@mesael.et` | Deputy GM (Approves standard requests) |
| **Mesael**| `mesael@mesael.et` | Owner / CEO (Approves high-value requests) |
| **Kalkidan** | `kalkidan@mesael.et` | Ledger & Reconciliation |
| **Yamrot** | `yamrot@mesael.et` | Billing & Tax Compliance |

---

## Optional: Viewing the Database Directly
If you want to view or manually edit the database records (e.g., Vouchers, Audit Logs), you can use Prisma Studio:
```bash
npx prisma studio
```
This will open a database GUI in your browser at `http://localhost:5555`.
