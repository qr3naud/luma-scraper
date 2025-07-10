# Luma Scraper API

A Python Flask API that scrapes Luma event attendee data and sends it to Clay for processing.

## Architecture

This scraper is part of a larger system:
1. **Frontend**: Lovable app (separate repo: `luma-matcher-frontend`)
2. **Scraper API**: This repository
3. **Processing**: Clay automation platform
4. **Flow**: Frontend → Scraper → Clay → Frontend

## API Endpoints

### POST /scrape
Scrapes a Luma event and sends attendee data to Clay for processing.

**Request:**
```json
{
  "event_url": "https://lu.ma/your-event",
  "description": "Looking for AI startup founders",
  "callback_url": "https://your-frontend.com/api/results"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Scraped 45 contacts and sent to Clay",
  "contacts_found": 45
}
```

### GET /health
Health check endpoint.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Add your Luma cookies to `cookies.json`

3. Update `CLAY_WEBHOOK` in `scraper_api.py`

4. Run locally:
```bash
python3 scraper_api.py
```

5. For public access (development):
```bash
npx ngrok http 10000
```

## Deployment

Deploy to Render.com, Railway, or similar service that supports Selenium.

## Environment Variables

- `CLAY_WEBHOOK_URL`: Clay webhook endpoint
- `MAX_USERS`: Maximum users to scrape (default: 50)

## Integration

The frontend should call this API when a user submits an event URL. Clay will process the data and send results back to the frontend's callback URL.

## Related Repositories

- Frontend: `luma-matcher-frontend` (Lovable) 