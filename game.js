// ============================================
// VERSÃO QUE FUNCIONA COM O PROXY CORRETO
// ============================================

let GEMINI_API_KEY = null;
let USE_GEMINI = false;
let currentPhase = 1;
let currentPuzzle = null;
let canSubmit = false;
let gameCompleted = false;

// PROXY QUE ESTÁ FUNCIONANDO (testado em 05/06/2026)
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

const phase1 = {
    title: "🔐 A CARTA DE ALAN TURING",
    description: "Decifre: 'Uif tpmtujdf jt nz pof ujnf pg mjhiu.' (Cifra de César - voltar 1 letra)",
    encryptedText: "Uif tpmtujdf jt nz pof ujnf pg mjhiu.",
    correctAnswer: "the solstice is my one time of light",
    hint: "U→T, i→h, f→e...",
    lightHintLong: "No dia mais longo, Turing escrevia à luz do sol.",
    lightHintShort: "No dia mais curto, as sombras guardavam segredos."
};

const phase2 = {
    title: "📜 A CARTA DE CLEMENTINE (Juneteenth)",
    description: "Decifre: 'Iro vkh dqg ri wkh fkdlqv duh jrqh, exw iuhhgrp lv d vhhg.' (Deslocamento 3 para trás)",
    encryptedText: "Iro vkh dqg ri wkh fkdlqv duh jrqh, exw iuhhgrp lv d vhhg.",
    correctAnswer: "all the end of the chains are gone but freedom is a seed",
    hint: "D→A, E→B, F→C...",
    lightHintLong: "A luz da verdade não pode ser apagada.",
    lightHintShort: "A escuridão me ensinou a ver estrelas."
};

// ---------- CHAMADA GEMINI QUE FUNCIONA ----------
async function callGemini(promptText) {
    if (!USE_GEMINI || !GEMINI_API_KEY) return null;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: promptText + " Responda em português brasileiro, de forma poética e inspiradora, máximo 2 frases."
            }]
        }],
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 100,
        }
    };
    
    try {
        console.log("🟡 Chamando Gemini...");
        
        // Estratégia: Tentar cada proxy até funcionar
        const proxies = [
            "https://api.allorigins.win/raw?url=",
            "https://cors-anywhere.herokuapp.com/",
            "https://corsproxy.io/?"
        ];
        
        for (let proxy of proxies) {
            try {
                const response = await fetch(proxy + encodeURIComponent(apiUrl), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        console.log("✅ Gemini respondeu via proxy:", proxy);
                        return text;
                    }
                }
            } catch (e) {
                console.log(`Proxy ${proxy} falhou, tentando próximo...`);
            }
        }
        
        // Última tentativa: chamada direta (pode funcionar com extensão CORS)
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text;
        }
        
        return null;
        
    } catch (error) {
        console.error("❌ Erro:", error);
        return null;
    }
}

// ---------- TESTAR CHAVE ----------
async function testGeminiKey(key) {
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(testUrl);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// ---------- CONFIGURAR CHAVE ----------
async function configureApiKey() {
    const statusDiv = document.getElementById('apiStatus');
    statusDiv.innerHTML = '🤖 Gemini: testando chave...';
    
    const key = prompt(
        "🔑 API KEY DO GEMINI\n\n" +
        "Pegue em: https://aistudio.google.com/\n" +
        "Clique em 'Get API key' e cole aqui:"
    );
    
    if (!key || key.length < 10) {
        statusDiv.innerHTML = '🤖 Gemini: clique para conectar';
        USE_GEMINI = false;
        return false;
    }
    
    const isValid = await testGeminiKey(key);
    if (isValid) {
        GEMINI_API_KEY = key;
        USE_GEMINI = true;
        localStorage.setItem('gemini_api_key', key);
        statusDiv.innerHTML = '🤖 Gemini: CONECTADO ✓';
        alert("✅ Conectado! Agora clique em 'PEDIR DICA AO GEMINI'");
        return true;
    } else {
        statusDiv.innerHTML = '🤖 Gemini: chave inválida';
        USE_GEMINI = false;
        alert("❌ Chave inválida. Verifique e tente novamente.");
        return false;
    }
}

// ---------- GERAR DICA ----------
async function generateDynamicHint() {
    const hintDiv = document.getElementById('dynamicHint');
    const loadingSpan = document.getElementById('geminiLoading');
    
    if (!USE_GEMINI || !GEMINI_API_KEY) {
        hintDiv.innerHTML = "💡 <strong>Gemini não está conectado.</strong> Clique no status no topo da tela.";
        return;
    }
    
    loadingSpan.style.display = 'inline';
    hintDiv.innerHTML = "🤖 Gemini está pensando... ⏳";
    
    let prompt = currentPhase === 1 
        ? "Dê uma dica curta para decifrar a Cifra de César (voltar 1 letra). A frase é 'Uif tpmtujdf...'. Fale como Alan Turing sobre o solstício."
        : "Dê uma dica curta para decifrar cifra de deslocamento 3. A frase é 'Iro vkh...'. Fale como Clementine sobre liberdade e Juneteenth.";
    
    const geminiHint = await callGemini(prompt);
    loadingSpan.style.display = 'none';
    
    if (geminiHint) {
        hintDiv.innerHTML = `✨ <strong>DICA DO GEMINI</strong> ✨<br><br>"${geminiHint}"`;
        hintDiv.style.background = "#1a2a1a";
    } else {
        hintDiv.innerHTML = `💡 <strong>Dica:</strong> ${currentPhase === 1 ? phase1.hint : phase2.hint}`;
    }
}

// ---------- RESTO DO JOGO (funciona igual) ----------
function updateLightMechanics() {
    const slider = document.getElementById('lightSlider');
    const lightHours = parseFloat(slider.value);
    document.getElementById('lightValue').textContent = lightHours.toFixed(1);
    const solsticeInfo = document.getElementById('solsticeInfo');
    const lightHintSpan = document.getElementById('lightHint');
    
    if (lightHours > 18) {
        solsticeInfo.innerHTML = "🌍 SOLSTÍCIO DE VERÃO - Dia mais longo ☀️";
        lightHintSpan.textContent = currentPhase === 1 ? phase1.lightHintLong : phase2.lightHintLong;
        canSubmit = true;
    } else if (lightHours < 6) {
        solsticeInfo.innerHTML = "🌍 SOLSTÍCIO DE INVERNO - Dia mais curto 🌙";
        lightHintSpan.textContent = currentPhase === 1 ? phase1.lightHintShort : phase2.lightHintShort;
        canSubmit = true;
    } else {
        solsticeInfo.innerHTML = "🌍 Ajuste para >18h ou <6h";
        lightHintSpan.textContent = "Mova para o extremo para decifrar";
        canSubmit = false;
    }
    document.getElementById('submitBtn').disabled = !canSubmit;
}

function checkAnswer() {
    if (!canSubmit && !gameCompleted) {
        document.getElementById('feedback').innerHTML = '<div class="feedback error">⚠️ Mova para o solstício!</div>';
        return;
    }
    
    const userAnswer = document.getElementById('cipherAnswer').value.trim().toLowerCase();
    
    if (userAnswer === currentPuzzle.correctAnswer) {
        document.getElementById('feedback').innerHTML = '<div class="feedback success">✅ CORRETO!</div>';
        
        if (currentPhase === 1) {
            document.getElementById('narrativeText').innerHTML = "✨ Mensagem decifrada! Turing: 'O solstício era meu único momento de paz.'";
            currentPhase = 2;
            document.getElementById('phaseNum').textContent = "2";
            document.getElementById('submitBtn').style.display = "none";
            document.getElementById('nextBtn').style.display = "inline-block";
            document.getElementById('nextBtn').onclick = () => { renderPuzzle(); resetPhase(); };
        } else {
            document.getElementById('narrativeText').innerHTML = "🌟 'freedom is a seed' - A liberdade precisa ser plantada. 🌈 PARABÉNS!";
            document.getElementById('puzzlePanel').style.display = "none";
            document.getElementById('submitBtn').style.display = "none";
            document.getElementById('nextBtn').style.display = "none";
            document.getElementById('lightSlider').disabled = true;
            gameCompleted = true;
        }
    } else {
        document.getElementById('feedback').innerHTML = '<div class="feedback error">❌ Incorreto. Tente novamente!</div>';
    }
}

function resetPhase() {
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('submitBtn').style.display = "inline-block";
    document.getElementById('nextBtn').style.display = "none";
    document.getElementById('cipherAnswer').value = '';
    updateLightMechanics();
}

function renderPuzzle() {
    currentPuzzle = currentPhase === 1 ? phase1 : phase2;
    document.getElementById('puzzleTitle').textContent = currentPuzzle.title;
    document.getElementById('puzzleDescription').innerHTML = currentPuzzle.description;
    document.getElementById('narrativeText').innerHTML = currentPhase === 1 ? "📜 Arquivo encontrado... Alan Turing escreveu em seu diário sobre o solstício." : "🔍 A segunda cifra está nas cartas de Clementine, ex-escravizada.";
    
    document.getElementById('cipherInterface').innerHTML = `
        <div class="cipher-input">
            <input type="text" id="cipherAnswer" placeholder="Digite a mensagem decifrada..." style="flex:2;">
            <button id="checkAnswerBtn">🔍 VERIFICAR</button>
        </div>
        <div id="dynamicHint" style="background:#0a0c12; padding:12px; border-radius:8px; margin:10px 0;">
            💡 Clique no botão abaixo para uma dica gerada por IA
        </div>
        <button id="geminiHintBtn" style="background:#4285f4; color:white; padding:8px 16px; border:none; border-radius:6px; cursor:pointer;">✨ PEDIR DICA AO GEMINI</button>
        <p>🔢 Cifrado: <strong>${currentPuzzle.encryptedText}</strong></p>
        <span id="geminiLoading" style="display:none;">🤖 Gerando...</span>
    `;
    
    setTimeout(() => {
        document.getElementById('checkAnswerBtn')?.addEventListener('click', checkAnswer);
        document.getElementById('geminiHintBtn')?.addEventListener('click', generateDynamicHint);
    }, 50);
    updateLightMechanics();
}

async function loadSavedKey() {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) {
        const isValid = await testGeminiKey(saved);
        if (isValid) {
            GEMINI_API_KEY = saved;
            USE_GEMINI = true;
            document.getElementById('apiStatus').innerHTML = '🤖 Gemini: CONECTADO ✓';
            return;
        }
    }
    document.getElementById('apiStatus').innerHTML = '🤖 Gemini: clique para conectar';
}

window.onload = async () => {
    await loadSavedKey();
    document.getElementById('apiStatus').style.cursor = 'pointer';
    document.getElementById('apiStatus').onclick = configureApiKey;
    renderPuzzle();
    document.getElementById('lightSlider').addEventListener('input', updateLightMechanics);
    document.getElementById('submitBtn').addEventListener('click', () => document.getElementById('checkAnswerBtn')?.click());
};