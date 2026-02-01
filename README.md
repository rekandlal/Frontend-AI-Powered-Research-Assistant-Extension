# 🚀 AI-Powered Research Assistant — Chrome Extension (Frontend)

This repository contains the **Chrome Extension frontend** for the AI-Powered Research Assistant.  
It provides a browser side panel UI where users can research, summarize, and ask AI-related questions about web content.

This extension communicates with a **separate Spring Boot backend server** for AI processing.

---

## 🏗 Project Architecture

| Layer | Repository | Description |
|------|-------------|-------------|
| 🎯 Frontend | This Repo | Chrome Extension UI (Side Panel) |
| 🧠 Backend | Separate Repo | Spring Boot AI processing server |

⚠️ The backend must be running for the extension to work.

---

## 📥 Install the Extension (Manual Method)

Since the extension is not on the Chrome Web Store, install it manually:

### 1️⃣ Download the Code

```bash
git clone https://github.com/rekandlal/Frontend-AI-Powered-Research-Assistant-Extension
```

Or download ZIP and extract.

---

### 2️⃣ Open Chrome Extensions

Go to:

```
chrome://extensions/
```

---

### 3️⃣ Enable Developer Mode

Turn ON **Developer mode** (top right).

---

### 4️⃣ Load the Extension

1. Click **Load unpacked**
2. Select the folder that contains `manifest.json`
3. Extension will appear in Chrome

📌 Pin it from the extensions toolbar for easy access.

---

## 🧠 Backend Requirement

This extension requires the backend server.

Backend repo:  
👉 `https://github.com/YOUR-USERNAME/YOUR-BACKEND-REPO`

Make sure backend is running at:

```
http://localhost:8080
```

---

## 🖥 How to Use

1. Open any webpage  
2. Click the extension icon  
3. Side panel will open  
4. Ask a question or request summary  
5. Results will be fetched from backend AI server  

---

## 🔐 Permissions Used

| Permission | Purpose |
|------------|---------|
| activeTab | Access current webpage content |
| scripting | Extract webpage text |
| storage | Save user settings |

Extension only runs when user interacts with it.

---

## ❓ Troubleshooting

**Extension not loading**
- Ensure correct folder selected
- Check `manifest.json` exists

**No AI response**
- Ensure backend server is running
- Check API URL inside JS files
- Check console errors

---

## 📌 Future Enhancements

- Publish to Chrome Web Store  
- Save research history  
- Add user login  
- Improve AI formatting  

---

💡 Part of a full-stack AI research assistant system.
