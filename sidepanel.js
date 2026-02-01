document.addEventListener('DOMContentLoaded', () => {
    const processBtn = document.getElementById('processBtn');
    const saveNotesBtn = document.getElementById('saveNotesBtn');
    const clearBtn = document.getElementById('clearBtn');
    const notesArea = document.getElementById('notes');
    const operationSelect = document.getElementById('operationSelect');

    // Load saved notes
    chrome.storage.local.get(['researchNotes'], (result) => {
        if (result.researchNotes) notesArea.value = result.researchNotes;
    });

    // Event listeners or different operation hai perform karne ke liye
     processBtn.addEventListener('click', processText);
    saveNotesBtn.addEventListener('click',  saveNotes);
    clearBtn.addEventListener('click',  clearResults);

    
    operationSelect.addEventListener('change', (e) => {
        const ops = {
             'summarize': '🚀 Summarize Text',
            'explain': '💡 Explain Simply', 
            'keywords' : '🔑 Extract Keywords',
            'suggest': '💭 Suggest Topics',
            'translate': '🌐 Translate Text',
            'sentiment': '😊 Analyze Sentiment',
            'qa': '❓ Generate Q&A',
            'steps' : '📋 Create Steps'
        };
        processBtn.innerHTML = ops[e.target.value] || '🚀 Process Text';
    });
});

async function processText() {
    const processBtn = document.getElementById('processBtn');
    const operation = document.getElementById('operationSelect').value;
    
    try {
        setLoadingState(true, operation);
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
            showResult("❌ No active webpage tab found. Open a webpage first.");
            return;
        }

        const [{ result: selectedText }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => window.getSelection().toString().trim()
        });

        if (!selectedText) {
            showResult("❌ Please select text on the webpage first.");
            return;
        }

        const response = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content: selectedText, 
                operation: operation 
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const result = await response.text();

        // 🔥 CLEAN AI RESPONSE
        const cleanResult = cleanAIResponse(result);

        // show clean output
        showResultWithCopy(cleanResult.replace(/\n/g, '<br>'), selectedText, operation);
    
    } catch (error) {
        console.error('Process error:', error);
        showResult(`❌ Error: ${error.message}. Check if localhost:8080 is running.`);
    } finally {
        setLoadingState(false);
    }
}

function saveNotes() {
    const notes = document.getElementById('notes').value;
    chrome.storage.local.set({ researchNotes: notes }, () => {
        showCleanToast("✅ Notes saved successfully!");
    });
}

function clearResults() {
    if (confirm('Clear current result?')) {
        document.getElementById('results').innerHTML = 
            '<p class="placeholder">Select text on webpage → Choose operation → Click Process → Get AI insights here</p>';
        adjustResultsHeight();
    }
}

function showResultWithCopy(content, originalText, operation) {
    const resultsBox = document.getElementById('results');
    const opNames = {
        'summarize': '✨ SUMMARY', 'explain': '💡 EXPLANATION', 
        'keywords': '🔑 KEYWORDS', 'suggest': '💭 SUGGESTIONS',
        'translate': '🌐 TRANSLATION', 'sentiment': '😊 SENTIMENT ANALYSIS',
        'qa': '❓ Q&A PAIRS', 'steps': '📋 STEP-BY-STEP'
    };
    
    resultsBox.innerHTML = `
        <div class="result-item">
            <div class="result-title">${opNames[operation] || 'RESULT'}</div>
            <div class="result-content">${content}</div>
            <div class="result-actions">
                <button id="copyResult" class="secondary-btn icon-btn">📋 Copy Result</button>
                <button id="copyOriginal" class="secondary-btn icon-btn">📄 Original Text</button>
            </div>
        </div>
    `;

    adjustResultsHeight();
    
    document.getElementById('copyResult').onclick = () => copyFeedback('copyResult', content.replace(/<br>/g, '\n'));
    document.getElementById('copyOriginal').onclick = () => copyFeedback('copyOriginal', originalText);
}


function showResult(content) {
    document.getElementById('results').innerHTML = `<div class="result-item"><div class="result-content">${content}</div></div>`;
    adjustResultsHeight();
}

function adjustResultsHeight() {
    const resultsBox = document.getElementById('results');
    const content = resultsBox.querySelector('.result-content');
    
    requestAnimationFrame(() => {
        if (content) {
            const scrollHeight = content.scrollHeight;
            const lineHeight = 30;
            const lineCount = Math.ceil(scrollHeight / lineHeight);
            const newHeight = Math.max(250, Math.min(600, lineCount * 35));
            resultsBox.style.minHeight = newHeight + 'px';
            resultsBox.scrollTop = 0;
        }
    });
}

function showCleanToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function setLoadingState(loading, operation = 'summarize') {
    const btn = document.getElementById('processBtn');
    const ops = {
        'summarize': '⏳ Generating Summary...',
        'explain': '💡 Explaining Simply...', 
        'keywords': '🔑 Extracting Keywords...',
        'suggest': '💭 Finding Topics...',
        'translate': '🌐 Translating...',
        'sentiment': '😊 Analyzing Sentiment...',
        'qa': '❓ Creating Q&A...',
        'steps': '📋 Generating Steps...'
    };
    btn.disabled = loading;
    btn.innerHTML = loading ? ops[operation] || '⏳ Processing...' : '🚀 Process Selected Text';
}


async function copyFeedback(btnId, text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const ta = document.createElement('textarea');
        ta.value = text; 
        document.body.appendChild(ta); 
        ta.select(); 
        document.execCommand('copy'); 
        document.body.removeChild(ta);
    }
    const btn = document.getElementById(btnId);
    const orig = btn.textContent;
    btn.textContent = '✅ Copied!';
    btn.style.background = '#dcfce7';
    setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
    }, 2000);
}