// ============================================
// THE CIPHER OF THE LONGEST LIGHT
// Versão com proxy CORS - FUNCIONA NO GITHUB PAGES
// ============================================

let GEMINI_API_KEY = null;
let USE_GEMINI = false;
let currentPhase = 1;
let currentPuzzle = null;
let canSubmit = false;
let gameCompleted = false;

// Proxy CORS gratuito e confiável
const CORS_PROXY = "https://corsproxy.io/?";

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

const narratives = {
    phase1_intro: "📜 Arquivo encontrado... Alan Turing escreveu em seu diário sobre o solstício.",
    phase1_success: "✨ Mensagem decifrada! Turing confidencia que o solstício era seu único momento de paz.",
    phase2_intro: "🔍 A segunda cifra está nas cartas de Clementine.",
    phase2_success: "🌟 Mensagem decifrada! A liberdade precisa ser plantada todos os dias."
};

// ---------- CHAMAR GEMINI VIA PROXY ----------
async function callGemini(promptText) {
    if (!USE_GEMINI || !GEMINI_API_KEY) return null;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: promptText + " Responda em português brasileiro, tom poético, máximo 2 frases curtas."
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
        }
    };
    
    try {
        console.log("Chamando Gemini via proxy...");
        
        const response = await fetch(CORS_PROXY + encodeURIComponent(apiUrl), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            console.error("Erro HTTP:", response.status);
            return null;
        }
        
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log("Gemini respondeu:", generatedText);
        return generatedText || null;
        
    } catch (error) {
        console.error("Erro:", error);
        return null;
    }
}

// ---------- GERAR DICA ----------
async function generateDynamicHint() {
    const hintDiv = document.getElementById('dynamicHint');
    const loadingSpan = document.getElementById('geminiLoading');
    
    if (!USE_GEMINI || !GEMINI_API_KEY) {
        hintDiv.innerHTML = `💡 <strong>Gemini não está conectado.</strong><br>
        Clique no status "🤖 Gemini: clique para conectar" no topo da tela.<br>
        Depois de conectar, clique novamente neste botão.`;
        return;
    }
    
    loadingSpan.style.display = 'inline';
    hintDiv.innerHTML = "🤖 Gemini está pensando... ⏳";
    
    let prompt = currentPhase === 1 
        ? "Dê uma dica curta e poética para decifrar uma Cifra de César (voltar 1 letra). A frase cifrada começa com 'Uif tpmtujdf'. Fale como Alan Turing, cientista gay que amava o solstício."
        : "Dê uma dica curta e poética para decifrar uma cifra de deslocamento 3 (voltar 3 letras). A frase cifrada começa com 'Iro vkh'. Fale como Clementine, uma mulher negra ex-escravizada que celebra Juneteenth.";
    
    const geminiHint = await callGemini(prompt);
    loadingSpan.style.display = 'none';
    
    if (geminiHint) {
        hintDiv.innerHTML = `✨ <strong>DICA GERADA POR GEMINI</strong> ✨<br><br>"${geminiHint}"`;
        hintDiv.style.animation = 'glow 0.5s ease';
        setTimeout(() => { hintDiv.style.animation = ''; }, 500);
    } else {
        hintDiv.innerHTML = `💡 <strong>Dica padrão:</strong> ${currentPhase === 1 ? phase1.hint : phase2.hint}<br><br>
        ⚠️ O proxy pode estar ocupado. Tente novamente ou use o navegador Firefox.<br>
        📝 <strong>Para a submissão da jam:</strong> anexe prints do Google AI Studio como prova.`;
    }
}

// ---------- TESTAR CHAVE API ----------
async function testGeminiKey(key) {
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(testUrl));
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
        "🔑 SUA CHAVE DA API DO GEMINI\n\n" +
        "1. Acesse https://aistudio.google.com/\n" +
        "2. Faça login com sua conta Google\n" +
        "3. Clique em 'Get API key'\n" +
        "4. Crie uma chave e copie\n\n" +
        "Cole a chave aqui:"
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
        statusDiv.innerHTML = '🤖 Gemini: chave inválida - clique para tentar';
        USE_GEMINI = false;
        alert("❌ Chave inválida. Verifique se copiou corretamente.");
        return false;
    }
}

// ---------- CARREGAR CHAVE SALVA ----------
async function loadSavedKey() {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        const isValid = await testGeminiKey(savedKey);
        if (isValid) {
            GEMINI_API_KEY = savedKey;
            USE_GEMINI = true;
            document.getElementById('apiStatus').innerHTML = '🤖 Gemini: CONECTADO ✓';
            return true;
        } else {
            localStorage.removeItem('gemini_api_key');
        }
    }
    document.getElementById('apiStatus').innerHTML = '🤖 Gemini: clique para conectar';
    return false;
}

// ---------- MECÂNICA DE LUZ ----------
function updateLightMechanics() {
    const slider = document.getElementById('lightSlider');
    const lightHours = parseFloat(slider.value);
    document.getElementById('lightValue').textContent = lightHours.toFixed(1);
    const solsticeInfo = document.getElementById('solsticeInfo');
    const lightHintSpan = document.getElementById('lightHint');
    
    if (lightHours > 18) {
        solsticeInfo.innerHTML = "🌍 HEMISFÉRIO NORTE - SOLSTÍCIO DE VERÃO ☀️<br>O dia mais longo do ano. A luz abundante revela sombras do passado.";
        lightHintSpan.textContent = currentPhase === 1 ? phase1.lightHintLong : phase2.lightHintLong;
        canSubmit = true;
    } else if (lightHours < 6) {
        solsticeInfo.innerHTML = "🌍 HEMISFÉRIO SUL - SOLSTÍCIO DE INVERNO 🌙<br>O dia mais curto. A escuridão guarda segredos.";
        lightHintSpan.textContent = currentPhase === 1 ? phase1.lightHintShort : phase2.lightHintShort;
        canSubmit = true;
    } else {
        solsticeInfo.innerHTML = "🌍 ENTRE SOLSTÍCIOS — Ajuste o slider para >18h (Norte) ou <6h (Sul)";
        lightHintSpan.textContent = "⚡ O solstício é necessário para decifrar.";
        canSubmit = false;
    }
    document.getElementById('submitBtn').disabled = !canSubmit;
}

// ---------- VERIFICAR RESPOSTA ----------
function checkAnswer() {
    if (!canSubmit && !gameCompleted) {
        document.getElementById('feedback').innerHTML = '<div class="feedback error">⚠️ Mova para o solstício (>18h ou <6h).</div>';
        return;
    }
    
    const userAnswer = document.getElementById('cipherAnswer').value.trim().toLowerCase();
    
    if (userAnswer === currentPuzzle.correctAnswer) {
        document.getElementById('feedback').innerHTML = '<div class="feedback success">✅ CORRETO!</div>';
        
        if (currentPhase === 1) {
            document.getElementById('narrativeText').innerHTML = narratives.phase1_success;
            currentPhase = 2;
            document.getElementById('phaseNum').textContent = "2";
            document.getElementById('submitBtn').style.display = "none";
            document.getElementById('nextBtn').style.display = "inline-block";
            document.getElementById('nextBtn').onclick = () => { renderPuzzle(); resetPhase(); };
        } else {
            document.getElementById('narrativeText').innerHTML = narratives.phase2_success + "\n\n🏆 PARABÉNS! Você honrou Turing, Juneteenth e o solstício. 🌈";
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
    document.getElementById('narrativeText').innerHTML = currentPhase === 1 ? narratives.phase1_intro : narratives.phase2_intro;
    
    document.getElementById('cipherInterface').innerHTML = `
        <div class="cipher-input">
            <input type="text" id="cipherAnswer" placeholder="Digite a mensagem decifrada (minúsculas)..." style="flex:2;">
            <button id="checkAnswerBtn">🔍 VERIFICAR</button>
        </div>
        <div id="dynamicHint" style="background:#0a0c12; padding:12px; border-radius:8px; margin:10px 0; font-size:0.9rem; border-left:3px solid #ffd966;">
            💡 Clique no botão abaixo para uma dica gerada por IA
        </div>
        <button id="geminiHintBtn" style="background:#4285f4; color:white; padding:8px 16px; margin-bottom:10px; border:none; border-radius:6px; cursor:pointer;">✨ PEDIR DICA AO GEMINI</button>
        <p style="font-size:0.8rem; color:#aaa;">🔢 Cifrado: <strong>${currentPuzzle.encryptedText}</strong></p>
        <span id="geminiLoading" style="display:none; font-size:0.8rem;">🤖 Gerando dica...</span>
    `;
    
    setTimeout(() => {
        document.getElementById('checkAnswerBtn')?.addEventListener('click', checkAnswer);
        document.getElementById('geminiHintBtn')?.addEventListener('click', generateDynamicHint);
    }, 50);
    updateLightMechanics();
}

// ---------- INICIALIZAÇÃO ----------
window.onload = async () => {
    await loadSavedKey();
    
    const statusDiv = document.getElementById('apiStatus');
    statusDiv.style.cursor = 'pointer';
    statusDiv.onclick = configureApiKey;
    
    renderPuzzle();
    document.getElementById('lightSlider').addEventListener('input', updateLightMechanics);
    document.getElementById('submitBtn').addEventListener('click', () => document.getElementById('checkAnswerBtn')?.click());
};

// CSS para animação
const style = document.createElement('style');
style.textContent = `
    @keyframes glow {
        0% { text-shadow: 0 0 0px #ffd966; }
        100% { text-shadow: 0 0 8px #ffd966; }
    }
    #apiStatus:hover { background: #2a2f3e; }
`;
document.head.appendChild(style);