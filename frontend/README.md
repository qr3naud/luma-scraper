# Frontend - Lovable App

This directory is reserved for the Lovable frontend application.

## 🎯 Integration Instructions

### 1. Create Your Lovable App
1. Go to [Lovable.dev](https://lovable.dev)
2. Create a new project
3. Set up the UI for event URL input and results display

### 2. Backend Integration
Configure your Lovable app to call the backend API:

```typescript
// Import shared types for type safety
import { ScrapeRequest, ScrapeResponse, ClayCallback } from '../shared/types';

// Call the scraper API
const scrapeLumaEvent = async (eventUrl: string, description: string): Promise<ScrapeResponse> => {
  const payload: ScrapeRequest = {
    event_url: eventUrl,
    description: description,
    callback_url: `${window.location.origin}/api/results` // Your frontend webhook endpoint
  };

  const response = await fetch('/api/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.json();
};
```

### 3. Webhook Endpoint
Create an endpoint in your Lovable app to receive results from Clay:

```typescript
// Handle Clay results
const handleClayResults = (results: ClayCallback) => {
  // Display the top 5 matches to the user
  console.log('Top matches:', results.top_matches);
  
  // Update UI with:
  // - Contact information
  // - Reasons for matching
  // - Pre-written LinkedIn messages
};
```

## 🏗️ Required Features

Your Lovable app should include:

### Input Form
- [ ] Event URL input field
- [ ] Description textarea ("Who do you want to meet?")
- [ ] Submit button

### Results Display
- [ ] Loading state while processing
- [ ] Top 5 contacts display
- [ ] Contact photos/profiles
- [ ] Match reasons
- [ ] Social media links
- [ ] Pre-written LinkedIn messages
- [ ] Copy-to-clipboard functionality

### Error Handling
- [ ] Invalid URL validation
- [ ] Network error handling
- [ ] Graceful loading states

## 🔗 API Endpoints

Your frontend needs to handle:

**Outgoing (to backend):**
- `POST /api/scrape` - Send event URL and description

**Incoming (from Clay):**
- `POST /api/results` - Receive processed results

## 📱 UI Recommendations

1. **Clean, modern interface**
2. **Mobile-responsive design**
3. **Clear call-to-action buttons**
4. **Professional appearance** (this is for networking!)
5. **Fast loading and smooth animations**

## 🚀 Development Workflow

1. **Test with backend locally**:
   ```bash
   # Backend running on localhost:10000
   # Configure Lovable to proxy API calls to localhost:10000
   ```

2. **Use ngrok for webhook testing**:
   ```bash
   npx ngrok http 3000  # Your Lovable dev server
   # Use this URL as callback_url in API calls
   ```

3. **Deploy together**:
   - Backend: Deploy to Render/Railway
   - Frontend: Lovable handles deployment
   - Update API base URL in frontend config

## 📋 Next Steps

1. Create the Lovable project
2. Implement the form and results UI
3. Add the API integration code above
4. Test the full flow end-to-end
5. Deploy both frontend and backend 