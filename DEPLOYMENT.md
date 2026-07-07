# Deployment Guide for AutoSphere on Render

This guide provides step-by-step instructions for deploying the AutoSphere application (React frontend, Django backend, and Node microservices) on Render.com.

Since Render does not offer native managed MongoDB, we will use MongoDB Atlas for our Node microservices and a free Supabase PostgreSQL database for our Django backend (to avoid Render's 30-day database expiry).

---

## Phase 1: Database Setup

### 1. MongoDB Atlas (For Node Microservices)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account/cluster.
2. Go to **Network Access** and add `0.0.0.0/0` (Allow access from anywhere) so Render can connect to it.
3. Go to **Database Access** and create a user with a strong password.
4. Click **Connect** on your cluster, select "Connect your application", and copy the connection string.
   - It will look like: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`

### 2. Supabase PostgreSQL (For Django Backend)
1. Go to [Supabase](https://supabase.com/) and create a free account.
2. Create a new Project and give your database a strong password.
3. Once the database is provisioned, go to **Project Settings** > **Database**.
4. Scroll down to **Connection string** > **URI**, and copy the connection string. Replace `[YOUR-PASSWORD]` with the database password you created.

---

## Phase 2: Deploy Django Backend (Web Service)

Your main Django backend requires a Python Web Service.

1. **Create the Web Service**
   - In Render, click **New +** > **Web Service**.
   - Connect your GitHub repository (`AbhishekPattnaik124/AutoSphere`).
   - Configure the service:
     - **Name**: `autosphere-backend`
     - **Environment**: `Python 3`
     - **Region**: (Match your PostgreSQL region)
     - **Root Directory**: `server`
     - **Build Command**: `pip install -r requirements.txt && python manage.py migrate`
     - **Start Command**: `gunicorn djangoproj.wsgi:application --bind 0.0.0.0:$PORT`

2. **Environment Variables**
   - Scroll down to **Environment Variables** and add:
     - `DATABASE_URL`: *(Paste the Connection string URI from Supabase)*
     - `PYTHON_VERSION`: `3.10.0`
     - `SECRET_KEY`: *(Generate a secure random string)*
     - `DEBUG`: `False`
     - `ALLOWED_HOSTS`: `*` (or your Render backend URL once generated)

3. Click **Create Web Service**. Render will now build and deploy your Django backend.

---

## Phase 3: Deploy Node.js Microservices (Web Services)

You have several microservices (`database`, `carsInventory`, etc.). You will deploy these as separate Node Web Services.

*Example for the `database` service (Dealership/Review API):*

1. **Create Web Service**
   - Click **New +** > **Web Service**.
   - Connect the same GitHub repository.
   - Configure:
     - **Name**: `autosphere-dealerships-api`
     - **Environment**: `Node`
     - **Root Directory**: `server/database`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start` (or `node app.js`)

2. **Environment Variables**
   - Add your MongoDB connection string:
     - `MONGO_URL`: *(Paste your MongoDB Atlas connection string)*

3. Click **Create Web Service**.
*(Repeat this process for your other Node microservices like `carsInventory` if needed).*

---

## Phase 4: Deploy React Frontend (Static Site)

Render offers highly optimized, free Static Site hosting for React apps.

### 1. Update API Endpoints
Before deploying, ensure your React app points to the deployed backend URLs rather than `localhost`.
- Update your `.env` file in your frontend or hardcoded fetch URLs in your codebase to point to your new backend URLs (e.g., `https://autosphere-backend.onrender.com`).
- Push this change to GitHub.

### 2. Create Static Site
- In Render, click **New +** > **Static Site**.
- Connect your GitHub repository.
- Configure:
  - **Name**: `autosphere-frontend`
  - **Root Directory**: `server/frontend`
  - **Build Command**: `npm install && npm run build`
  - **Publish Directory**: `server/frontend/build`

### 3. Environment Variables
- Expand the "Advanced" section to add any frontend env variables required:
  - `REACT_APP_GEMINI_API_KEY`: *(Paste your Google Gemini API Key here)*

### 4. Client-Side Routing Setup
- Under the "Redirects/Rewrites" tab in Render settings for this site, add a rule to fix React Router on page refresh:
  - **Source**: `/*`
  - **Destination**: `/index.html`
  - **Action**: `Rewrite`

5. Click **Create Static Site**.

---

## Post-Deployment Checklist

- **CORS Configuration**: In your Django `settings.py`, ensure your `CORS_ALLOWED_ORIGINS` includes your new Render frontend URL (`https://autosphere-frontend.onrender.com`).
- **Superuser Creation**: Once the Django backend is live, you can go to your Render Web Service dashboard, click the **Shell** tab, and run `python manage.py createsuperuser` to create your admin account.
- **Database Seeding**: Run your population scripts (e.g., `python manage.py shell < populate.py` or hit your `/djangoapp/populate` endpoint) to fill the PostgreSQL database with initial Make/Model data. Do the same for MongoDB by triggering your Node database seed endpoints.
