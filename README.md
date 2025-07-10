# Luma Event Matcher

A full-stack application where event-goers can input a Luma event URL with a description of who they want to meet, and receive the top 5 people they should connect with, including personalized LinkedIn messages.

## 🏗️ Architecture

```
Frontend (Lovable) → Backend (Flask API) → Clay (Processing) → Frontend (Results)
```

**Flow:**
1. User submits event URL + description via Lovable frontend
2. Frontend calls Flask API to scrape event attendees  
3. Backend sends contact data + user intent to Clay
4. Clay processes data, finds top 5 matches, creates LinkedIn messages
5. Clay sends results back to frontend via webhook

## 📁 Project Structure

```
luma-matcher/
├── frontend/               # Lovable React app
│   └── (Lovable manages this directory)
├── backend/                # Python Flask API + Selenium scraper
│   ├── scraper_api.py     # Main Flask API
│   ├── luma_scraper.py    # Standalone scraper
│   ├── requirements.txt   # Python dependencies
│   ├── cookies.json       # Luma authentication
│   └── Dockerfile         # For deployment
├── shared/                 # Shared TypeScript types
│   └── types.ts           # API contract definitions
└── README.md              # This file
```

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python3 scraper_api.py
```
API will be available at `http://localhost:10000`

### Frontend Setup
The frontend is managed by Lovable. Configure it to call your backend API.

### Development Workflow
1. **Test backend locally**: Ensure scraping and Clay integration works
2. **Connect frontend**: Point Lovable to your local/deployed API
3. **Deploy**: Backend to Render/Railway, frontend via Lovable

## 📡 API Contract

### POST /scrape
Scrapes event attendees and sends to Clay for processing.

**Request:** (See `shared/types.ts` for TypeScript definitions)
```json
{
  "event_url": "https://lu.ma/ai-startup-meetup",
  "description": "Looking for AI startup founders",
  "callback_url": "https://your-frontend.com/api/results"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Scraped 25 contacts and sent to Clay",
  "contacts_found": 25
}
```

### GET /health
Health check endpoint.

## 🔧 Configuration

### Environment Variables
- `CLAY_WEBHOOK_URL`: Clay webhook endpoint
- `MAX_USERS`: Maximum users to scrape (default: 5)

### Local Development
For local testing with external webhooks:
```bash
# Expose your local API publicly
npx ngrok http 10000
```

## 🚀 Deployment

### Backend
Deploy to services that support Selenium:
- **Render.com** (Recommended)
- **Railway**  
- **Heroku**

### Frontend
Lovable handles frontend deployment automatically.

## 🔗 Integration Guide

### Frontend → Backend
```typescript
// Use shared types for type safety
import { ScrapeRequest, ScrapeResponse } from '../shared/types';

const response = await fetch('/api/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestData)
});
```

### Clay → Frontend
Clay will send results to your `callback_url` using the `ClayCallback` type from `shared/types.ts`.

## 🎯 Next Steps

1. **Test the scraper**: Use a real Luma event URL
2. **Configure Clay**: Set up the automation workflow
3. **Connect frontend**: Integrate with your Lovable app
4. **Deploy**: Both backend and frontend to production

## 📝 Notes

- **Cookies**: The `cookies.json` file contains authentication for Luma
- **Type Safety**: Use `shared/types.ts` in both frontend and backend
- **Monorepo Benefits**: Single source of truth, coordinated deployments 