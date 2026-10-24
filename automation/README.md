# Califnco Water Purifier — AI Automation & Social Publishing

This directory contains the automation workflow templates and configuration guidelines for:
1. **Daily Scheduled Instagram Product Posting** (25 Points)
2. **WhatsApp Status Daily Posting via WAHA Docker** (+10 Points Bonus)

---

## 1. Instagram Daily Automation (25 Points)

### Architecture
```
[Schedule Trigger: 10:00 AM IST]
            ↓
[Google Sheets: Fetch PENDING Product]
            ↓
[AI Caption & Hashtags Generator: Gemini / Groq API]
            ↓
[AI Product Image Generator: HuggingFace / Pollinations / Cloudinary]
            ↓
[Instagram Graph API: Create Media Container (/{ig-user-id}/media)]
            ↓
[Instagram Graph API: Publish Media (/{ig-user-id}/media_publish)]
            ↓
[Google Sheets: Update Status to 'POSTED' with Timestamp]
```

### Google Sheet Configuration
Create a Google Spreadsheet named `Califnco_Catalog` with a sheet named `Products` and these exact headers:
```
product_name | features | price | image_prompt | status | image_url | caption | posted_at | error
```

Sample row to test:
- **product_name**: Califnco Aqua Premier 10L RO+UV
- **features**: 10-stage purification, active copper, mineral booster, 10L tank
- **price**: ₹13,999
- **image_prompt**: modern smart kitchen countertop with sleek water purifier, high-end photography, 4k
- **status**: PENDING

### Setting Up in n8n
1. Start n8n locally with Docker:
   ```bash
   docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
   ```
2. Open `http://localhost:5678`.
3. Click **Workflows** > **Import from File** > Select `automation/instagram_daily_product.json`.
4. Configure Credentials:
   - **Google Sheets OAuth2**: Connect your Google account containing the `Products` sheet.
   - **AI Provider**:
     - *Gemini API (Free Tier)*: Add your Google AI Studio API key in an HTTP Request node with endpoint `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY`.
     - Prompt: *"Write an engaging Instagram caption with bulleted benefits and 10 trending hashtags for this water purifier: {{ $json.product_name }} - {{ $json.features }}"*
   - **AI Image Generation**: Use HuggingFace Inference API (`stabilityai/stable-diffusion-xl-base-1.0`) or Pollinations.ai free image endpoint:
     `https://image.pollinations.ai/prompt/{{ encodeURIComponent($json.product_name + ' water purifier modern kitchen appliance') }}`
   - **Instagram Meta Graph API**:
     - Step A: `POST https://graph.facebook.com/v21.0/{ig-user-id}/media?image_url={image_url}&caption={caption}&access_token={token}`
     - Step B: `POST https://graph.facebook.com/v21.0/{ig-user-id}/media_publish?creation_id={creation_id}&access_token={token}`
5. Click **Test Step** to post 1 product immediately, then toggle workflow to **Active**.

---

## 2. Bonus (+10 Points): WhatsApp Status Automation via WAHA

WAHA (WhatsApp HTTP API) is a free, open-source WhatsApp API running locally via Docker.

### Running WAHA
```bash
docker run -d --name waha -p 3000:3000 devlikeapro/waha
```

1. Open `http://localhost:3000/dashboard` in your browser.
2. Click **Start Session** and scan the QR code with a secondary WhatsApp number.
3. In your n8n workflow or script, add an HTTP Request node to post status:
   - **Method**: `POST`
   - **URL**: `http://localhost:3000/api/sendText` (or `/api/sendImage` for media status)
   - **Body (JSON)**:
     ```json
     {
       "session": "default",
       "chatId": "status@broadcast",
       "file": {
         "url": "{{ $json.image_url }}"
       },
       "caption": "💧 Daily Water Purifier Deal: {{ $json.product_name }} - Now at ₹{{ $json.price }}! DM to order."
     }
     ```
4. This automatically publishes the daily product to your WhatsApp Status!
