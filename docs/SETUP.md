# Setup Guide

## Prerequisites

1. **Node.js 20+** — [Download](https://nodejs.org/)
2. **Python 3.12+** — [Download](https://www.python.org/downloads/)
3. **Groq API Key** (optional) — [Get one free](https://console.groq.com)

---

## Step 1: Clone & Navigate

```bash
cd /path/to/Perfume
```

---

## Step 2: Frontend Setup

```bash
cd frontend
npm install
```

**Start dev server:**
```bash
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## Step 3: Backend Setup

Open a **new terminal** in the project root:

```bash
cd backend
```

### Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Set Groq API Key (Optional)

**Windows CMD:**
```cmd
set GROQ_API_KEY=your_key_here
```

**Windows PowerShell:**
```powershell
$env:GROQ_API_KEY="your_key_here"
```

**macOS/Linux:**
```bash
export GROQ_API_KEY="your_key_here"
```

Or create a `.env` file:
```bash
cp .env.example .env
# Edit .env and add your key
```

### Start Backend

```bash
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**

---

## Step 4: Use the App

1. Open **http://localhost:5173** in your browser
2. Click **"Add"** in the Loved or Hated section
3. Search for a fragrance (e.g., "Creed Aventus")
4. Add price (optional) and save
5. Repeat to build your profile
6. Go to **Risk Engine** section
7. Search for a target fragrance
8. Click **"Calculate Risk"**
9. Review your personalized risk score and AI insight

---

## Troubleshooting

### Frontend won't start
- Make sure Node.js 20+ is installed: `node -v`
- Delete `node_modules` and `package-lock.json`, then `npm install` again

### Backend won't start
- Make sure Python 3.12+ is installed: `python --version`
- Activate virtual environment first
- Check if port 8000 is already in use

### Fragrance search fails
- Backend must be running
- Check browser console for errors
- Fragrantica may be rate-limiting — wait a minute and try again

### AI insights not showing
- Make sure `GROQ_API_KEY` is set
- Check backend logs for Groq errors
- Verify your API key at [console.groq.com](https://console.groq.com)

---

## Production Build

### Frontend
```bash
cd frontend
npm run build
npm run preview  # Test production build
```

### Backend
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Next Steps

- Add more fragrances to your vault
- Experiment with different target fragrances
- Try different currencies
- Share your risk scores with friends

Enjoy your blind buy intelligence! 🎯
