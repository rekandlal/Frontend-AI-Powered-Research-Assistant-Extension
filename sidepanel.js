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
