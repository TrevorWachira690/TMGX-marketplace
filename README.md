# TBM-DeepIn — Practice Project

**IYF Weekend Academy — Season 11 Flagship Project**

TBM-DeepIn is a full-stack small-business community platform where users can register as a business or customer, log in, create marketplace listings, comment on listings, and manage their profiles.

> **This is the `community-hub-practice/` folder — start here.** Most of
> the app already works. A specific set of features are intentionally
> left incomplete, marked with `// TODO(Student N - ...)` comments in the
> code, so each of the 7 team members has real gaps to fill in as they
> learn. Every gap has a matching teaching guide in `docs/` that walks
> through it using a 6-step method: analogy → line-by-line breakdown →
> walkthrough → plain language → concise explanation → summary table.
>
> **Read `TEAM_DIVISION.md` first** to find your name/group and which
> files and features are yours. Then open your matching file in `docs/`.
> Don't jump to a finished answer — a completed reference version exists
> separately, but the point of this folder is to write the code yourself.

## Live Demo URLs

- Frontend: _to be filled in after deployment (Vercel/Netlify)_
- Backend: _to be filled in after deployment (Render/Railway)_
- Backend health check: `<backend-url>/api/health`

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (JSON Web Tokens), bcrypt for password hashing
- **Deployment:** Render (backend) + Vercel (frontend)

## Features

### MVP (all implemented)
- User registration & login with hashed passwords and JWT auth
- Role selection: business or customer (backend validates; frontend picker is a TODO)
- Business profiles get additional fields: business name, category, location, contact phone
- Protected routes (frontend + backend)
- User profiles (view, edit name/bio/avatar)
- Create and read marketplace listings, with pagination
- Full-text search over listings (title, description, category)
- Comments (create, view, delete own comments)
- Responsive design (mobile, tablet, desktop)
- Data export/import (JSON) for a user's own listings

### Stretch goals
- Search and filtering on listings ✅ implemented
- Likes/reactions on listings — not implemented
- Image uploads for listings — base64 image field supported; file upload UI not implemented
- Real-time updates with WebSockets — not implemented

## Setup Instructions

### Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, CLIENT_URL in .env
npm install
npm run dev
```
Backend runs on `http://localhost:5000` by default. Confirm it's healthy at
`http://localhost:5000/api/health`.

### Frontend
```bash
npm install
cp .env.example .env
# Set VITE_API_URL to your backend URL, e.g. http://localhost:5000/api
npm run dev
```
Frontend runs on `http://localhost:5173` by default.

## API Endpoints

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account (role: business or customer) |
| POST | `/api/auth/login` | No | Log in, get JWT |
| GET | `/api/posts` | No | List marketplace listings (paginated: `?page=&limit=`) |
| GET | `/api/posts/search` | No | Search listings (`?q=`) |
| GET | `/api/posts/:id` | No | Get one listing |
| POST | `/api/posts` | Yes | Create listing (title, description, price, category required) |
| PUT | `/api/posts/:id` | Yes (author) | Edit own listing |
| DELETE | `/api/posts/:id` | Yes (author) | Delete own listing |
| GET | `/api/comments/post/:postId` | No | Comments for a listing |
| POST | `/api/comments` | Yes | Add comment |
| DELETE | `/api/comments/:id` | Yes (author) | Delete own comment |
| GET | `/api/users/me` | Yes | Current user profile |
| GET | `/api/users/:id` | No | Public profile + their listings |
| PUT | `/api/users/me` | Yes | Edit own profile |
| GET | `/api/users/export` | Yes | Export own data as JSON |
| POST | `/api/users/import` | Yes | Import listings from JSON |

## Team Division Summary

See `TEAM_DIVISION.md` for full detail. Five groups, seven students:
public frontend, admin frontend, backend & data storage, styling & assets,
deployment & documentation.

## Author Credits

See `CONTRIBUTORS.md`.

## License

MIT — free to use for educational purposes as part of IYF Weekend Academy.
