let wordReplacements = {};
let reverseReplacements = {};
let isDictionaryLoaded = false;

function getSequenceString(index) {
    let result = "";
    let base = 26;
    let temp = index;

    while (temp >= 0) {
        result = String.fromCharCode(97 + (temp % base)) + result;
        temp = Math.floor(temp / base) - 1;
    }
    return result;
}

async function loadDwylDictionary() {
    const outputDiv = document.getElementById('output');
    outputDiv.textContent = "Loading dictionary components from GitHub...";

    try {
        const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt');
        if (!response.ok) throw new Error("Failed to fetch dictionary file.");

        const textData = await response.text();
        const words = textData.split('\n').map(w => w.trim()).filter(w => w.length > 0);

        words.forEach((word, index) => {
            const lowerWord = word.toLowerCase();
            const sequenceKey = getSequenceString(index);

            wordReplacements[lowerWord] = sequenceKey;
            reverseReplacements[sequenceKey] = lowerWord;
        });

        isDictionaryLoaded = true;
        outputDiv.textContent = "Dictionary ready! Type above to translate.";
        updateTranslation();
    } catch (error) {
        console.error("Error setting up dynamic dictionary:", error);
        outputDiv.textContent = "Error loading dictionary. Check network connections.";
    }
}

function performTranslation(userInput, mode) {
    if (!userInput.trim() || !isDictionaryLoaded) return userInput;

    const activeDictionary = (mode === "encode") ? wordReplacements : reverseReplacements;
    const wordRegex = /\b[a-zA-Z]+\b/g;

    return userInput.replace(wordRegex, (match) => {
        const lowerMatch = match.toLowerCase();
        
        if (activeDictionary[lowerMatch]) {
            const substitution = activeDictionary[lowerMatch];
            // Basic casing preservation matching your original setup
            return match[0] === match[0].toUpperCase() 
                ? substitution.charAt(0).toUpperCase() + substitution.slice(1) 
                : substitution;
        }
        return match; 
    });
}

const inputArea = document.getElementById('input');
const outputDiv = document.getElementById('output');
const modeSelect = document.getElementById('mode');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const speakBtn = document.getElementById('speakBtn');

function updateTranslation() {
    if (!isDictionaryLoaded) return;
    const currentMode = modeSelect.value;
    const textToTranslate = inputArea.value;
    outputDiv.textContent = performTranslation(textToTranslate, currentMode);
}

inputArea.addEventListener('input', updateTranslation);
modeSelect.addEventListener('change', updateTranslation);

speakBtn.addEventListener('click', () => {
    const textToSpeak = outputDiv.textContent.trim();
    if (!textToSpeak || !isDictionaryLoaded) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    speakBtn.textContent = "Speaking...";
    utterance.onend = () => speakBtn.textContent = "Speak";
    utterance.onerror = () => speakBtn.textContent = "Speak";
    window.speechSynthesis.speak(utterance);
});

copyBtn.addEventListener('click', () => {
    const textToCopy = outputDiv.textContent;
    if (!textToCopy || !isDictionaryLoaded) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
        copyBtn.textContent = "Copied!";
        copyBtn.style.backgroundColor = "#17b978";
        setTimeout(() => {
            copyBtn.textContent = "Copy";
            copyBtn.style.backgroundColor = "#1e3d59";
        }, 1500);
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
});

clearBtn.addEventListener('click', () => {
    inputArea.value = "";
    outputDiv.textContent = isDictionaryLoaded ? "" : "Dictionary ready! Type above to translate.";
    inputArea.focus();
});

loadDwylDictionary();
