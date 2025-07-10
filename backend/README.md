# Backend - Luma Scraper API

Python Flask API that scrapes Luma event attendees using Selenium and sends data to Clay for processing.

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
python3 scraper_api.py
```

API will be available at `http://localhost:10000`

## 📋 Requirements

- **Python 3.8+**
- **Chrome/Chromium** browser (for Selenium)
- **ChromeDriver** (managed automatically by Selenium)

## 🔧 Configuration

### Environment Variables
```bash
export CLAY_WEBHOOK_URL="https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-your-id"
export MAX_USERS="5"  # Maximum users to scrape per event
```

### Authentication
Make sure `cookies.json` contains valid Luma session cookies.

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:10000/health
```

### Test Scraping
```bash
curl -X POST http://localhost:10000/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "event_url": "https://lu.ma/your-event-url",
    "description": "Looking for AI startup founders",
    "callback_url": "https://your-callback-url.com/results"
  }'
```

## 📁 Files

- **`scraper_api.py`**: Main Flask API with scraping logic
- **`luma_scraper.py`**: Standalone scraper (can be run independently)
- **`requirements.txt`**: Python dependencies
- **`cookies.json`**: Luma authentication cookies
- **`Dockerfile`**: For containerized deployment

## 🚀 Deployment

### Option 1: Render.com (Recommended)
1. Connect your GitHub repo
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `python3 scraper_api.py`
4. Add environment variables

### Option 2: Railway
```bash
railway login
railway init
railway up
```

### Option 3: Docker
```bash
docker build -t luma-scraper .
docker run -p 10000:10000 luma-scraper
```

## 🐛 Troubleshooting

### Common Issues

**Chrome not found:**
```bash
# macOS
brew install --cask google-chrome

# Ubuntu
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo apt-get update
sudo apt-get install google-chrome-stable
```

**Selenium errors:**
- Ensure Chrome is installed
- Check if cookies.json has valid session
- Try running with `--headless` flag disabled for debugging

**Clay webhook fails:**
- Verify CLAY_WEBHOOK_URL is correct
- Check Clay webhook logs
- Ensure JSON payload matches Clay's expected format

## 📊 Monitoring

The API includes basic logging. In production, consider adding:
- Structured logging (JSON)
- Error tracking (Sentry)
- Metrics collection
- Health checks

## 🔍 Development

### Local Development with Frontend
```bash
# Terminal 1: Start backend
cd backend
python3 scraper_api.py

# Terminal 2: Expose via ngrok (for webhook testing)
npx ngrok http 10000
```

### Code Structure
```python
# scraper_api.py structure
├── Flask app setup
├── /scrape endpoint (main business logic)
├── scrape_luma_event() (Selenium automation)
├── extract_socials() (social media parsing)
├── send_to_clay() (Clay integration)
└── /health endpoint
``` 