# FreshRoots Deployment

## Production setup

Frontend:
- Build from `frontend/` with `npm install` and `npm run build`
- Set `VITE_API_URL` only when the API is hosted on a different domain than the frontend
- If the frontend and backend share one domain, the frontend will call `/api` automatically in production

Backend:
- Start from `backend/` with `npm install` and `npm start`
- Provide all variables from `backend/.env.example`
- Set `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` to the exact deployed frontend origins

## Recommended hosting split

Frontend:
- Vercel, Netlify, or any static host that supports SPA rewrites to `index.html`

Backend:
- Render, Railway, Fly.io, or any Node host with MongoDB and Cloudinary environment variables configured

## Verification checklist

- Frontend build succeeds with `npm run build`
- Backend starts with `npm start`
- `GET /api/health` returns `200 OK`
- Frontend can log in and fetch products using the deployed API origin
- SPA hosting rewrites unknown routes like `/marketplace` and `/orders` to `index.html`