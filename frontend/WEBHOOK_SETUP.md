# Webhook System Setup Documentation

## 🚀 **Complete Data Flow Architecture**

Your Luma Scraper now uses a **webhook-based architecture** instead of direct scraping:

```
Frontend → Python Script → Clay → Frontend
     ↘→ Clay (Profile Intent)
```

### **Step-by-Step Data Flow:**
1. **Frontend** sends `event_url` → **Python Script** (`http://localhost:10000/scrape`)
2. **Frontend** sends `profileIntent` → **Clay** (`https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-cdefd0cb-29fb-4b85-a451-26553f4e9402`)
3. **Python Script** scrapes data → sends to **Clay**
4. **Clay** processes/enriches data → sends to **Frontend Webhook** (`http://localhost:3001/api/webhooks/clay-data`)
5. **Frontend** polls for processed data and displays results

---

## 📡 **Webhook Server Configuration**

### **Server Details:**
- **Port:** `3001`
- **Framework:** Express.js with CORS enabled
- **Data Storage:** In-memory Map (with optional file persistence)

### **Key Endpoints:**

#### 1. **Health Check**
```bash
GET http://localhost:3001/health
```
**Response:** `{"status":"ok","message":"Webhook server is running"}`

#### 2. **Clay Data Webhook** ⭐
```bash
POST http://localhost:3001/api/webhooks/clay-data
Content-Type: application/json

{
  "attendees": [...],
  "eventUrl": "https://lu.ma/event-url",
  "profileIntent": "Your profile intent",
  "sessionId": "optional-session-id"
}
```

#### 3. **Get Latest Data** (Frontend Polling)
```bash
GET http://localhost:3001/api/data/latest
```

#### 4. **Get Specific Data**
```bash
GET http://localhost:3001/api/data/{sessionId}
```

---

## 🔧 **How to Configure Clay Webhook**

### **Clay Webhook URL:**
```
http://localhost:3001/api/webhooks/clay-data
```

### **Expected Clay Payload Format:**
```json
{
  "attendees": [
    {
      "name": "John Doe",
      "email": "john@example.com", 
      "company": "Company Name",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "leadScore": 85,
      "reasonForInterest": "AI/ML expertise relevant to our product"
    }
  ],
  "eventUrl": "https://lu.ma/original-event-url",
  "profileIntent": "Looking for AI/ML engineers",
  "sessionId": "unique-session-identifier"
}
```

---

## 🖥️ **Frontend Polling System**

### **Polling Behavior:**
- **Frequency:** Every 5 seconds
- **Max Duration:** 5 minutes (60 attempts)
- **Auto-cleanup:** Polling stops when data is received or timeout reached

### **User Experience:**
1. ⏳ "Sending data to Python script..."
2. 🔄 "Waiting for Clay to return processed data..."
3. ✅ "Processing complete! Found X attendees from Clay."

---

## 🚀 **Running the Application**

### **Start Both Servers:**
```bash
npm run dev:full
```
This starts:
- **Frontend:** `http://localhost:8080` (Vite)
- **Webhook Server:** `http://localhost:3001` (Express)

### **Individual Commands:**
```bash
# Frontend only
npm run dev

# Webhook server only  
npm run webhook

# Both together
npm run dev:full
```

---

## 🧪 **Testing the Webhook System**

### **1. Test Webhook Endpoint:**
```bash
curl -X POST http://localhost:3001/api/webhooks/clay-data \
  -H "Content-Type: application/json" \
  -d '{
    "attendees": [
      {"name": "Test User", "email": "test@example.com", "company": "Test Co", "leadScore": 90}
    ],
    "eventUrl": "https://lu.ma/test-event",
    "sessionId": "test-123"
  }'
```

### **2. Test Data Retrieval:**
```bash
# Get latest data
curl http://localhost:3001/api/data/latest

# Get specific data
curl http://localhost:3001/api/data/test-123
```

---

## 🔄 **Production Considerations**

### **For Production Deployment:**

1. **Replace In-Memory Storage:**
   - Use PostgreSQL, MongoDB, or Redis
   - Add proper data persistence

2. **Add Authentication:**
   - Secure webhook endpoints with API keys
   - Validate incoming requests from Clay

3. **Error Handling:**
   - Add retry logic for failed requests
   - Implement proper logging system

4. **Scaling:**
   - Use PM2 or similar for process management
   - Add load balancing if needed

---

## 🛠️ **Configuration Variables**

### **Current Endpoints:**
- **Python Script:** `http://localhost:10000/scrape`
- **Clay Webhook:** `https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-cdefd0cb-29fb-4b85-a451-26553f4e9402`
- **Frontend Webhook:** `http://localhost:3001/api/webhooks/clay-data`

### **Customization:**
Update these URLs in `src/hooks/useEventScraper.tsx` as needed for your environment.

---

## ✅ **Verification Checklist**

- [x] ✅ **Supabase removed** - No more edge functions
- [x] ✅ **Scraping functions removed** - Replaced with webhook calls  
- [x] ✅ **Python script integration** - Event URL sent to Python
- [x] ✅ **Clay integration** - Profile intent sent directly to Clay
- [x] ✅ **Webhook server running** - Express server on port 3001
- [x] ✅ **Frontend polling** - Automatic data retrieval from Clay
- [x] ✅ **Error handling** - Proper timeout and error states
- [x] ✅ **Loading states** - Clear user feedback during processing

---

## 🎯 **Next Steps**

1. **Configure your Python script** to accept POST requests at `http://localhost:10000/scrape`
2. **Set up Clay** to send processed data to `http://localhost:3001/api/webhooks/clay-data`
3. **Test the complete flow** with a real Luma event URL
4. **Monitor the logs** in both frontend and webhook server for debugging

Your application is now ready for the webhook-based architecture! 🚀 