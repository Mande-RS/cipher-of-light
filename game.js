// ============================================
// THE CIPHER OF THE LONGEST LIGHT - VERSÃO DEFINITIVA
// Com proxy CORS para Gemini funcionar
// ============================================

let GEMINI_API_KEY = null;
let USE_GEMINI = false;
let currentPhase = 1;
let currentPuzzle = null;
let canSubmit = false;
let gameCompleted = false;

// ---------- DADOS DOS PUZZLES ----------
const phase1 = {
    title: "🔐 A CARTA DE ALAN TURING",
    description: "Você encontrou um bilhete cifrado no diário de Turing. Ele escreveu:\n\n\"Uif tpmtujdf jt nz pof ujnf pg mjhiu.\"\n\nTuring usava Cifra de César (deslocamento de 1 letra para trás). Decifre a mensagem.",
    encryptedText: "Uif tpmtujdf jt nz pof ujnf pg mjhiu.",
    correctAnswer: "the solstice is my one time of light",
    hint: "Volte uma letra no alfabeto: U→T, i→h, f→e...",
    lightHintLong: "No dia mais longo, Turing escrevia à luz do sol.",
    lightHintShort: "No dia mais curto, as sombras guardavam segredos."
};

const phase2 = {
    title: "📜 A CARTA DE CLEMENTINE (Juneteenth)",
    description: "Clementine deixou um código. Cada letra foi deslocada 3 posições (A→D, B→E...).\n\nMensagem: \"Iro vkh dqg ri wkh fkdlqv duh jrqh, exw iuhhgrp lv d vhhg.\"",
    encryptedText: "Iro vkh dqg ri wkh fkdlqv duh jrqh, exw iuhhgrp lv d vhhg.",
    correctAnswer: "all the end of the chains are gone but freedom is a seed",
    hint: "Deslocamento de 3 letras para trás (D→A, E→B).",
    lightHintLong: "A luz da verdade não pode ser apagada.",
    lightHintShort: "A escuridão me ensinou a ver estrelas."
};

const narratives = {
    phase1_intro: "📜 Arquivo encontrado... Alan Turing escreveu em seu diário sobre o solstício.",
    phase1_success: "✨ Mensagem decifrada! Turing confidencia que o solstício era seu único momento de paz.",
    phase2_intro: "🔍 A segunda cifra está nas cartas de Clementine.",
    phase2_success: "🌟 Mensagem decifrada! A liberdade precisa ser plantada todos os dias."
};

// ---------- PROXY CORS GRATUITO (resolve o problema!) ----------
// Usamos o CORS Anywhere para contornar bloqueios do navegador
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// ---------- TESTAR CHAVE API ----------
async function testGeminiKey(key) {
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(testUrl);
        if (response.ok) {
            return true;
        } else {
            const error = await response.json();
            console.error("Erro na chave:", error);
            return false;
        }
    } catch (error) {
        console.error("Erro de rede:", error);
        return false;
    }
}

// ---------- CONFIGURAR CHAVE API ----------
async function configureApiKey() {
    const statusDiv = document.getElementById('apiStatus');
    statusDiv.innerHTML = '🤖 Gemini: testando chave...';
    
    const key = prompt(
        "🔑 COLOQUE SUA CHAVE DA API DO GEMINI:\n\n" +
        "1. Acesse https://aistudio.google.com/\n" +
        "2. Clique em 'Get API key'\n" +
        "3. Crie uma chave e copie\n\n" +
        "Cole aqui:"
    );
    
    if (!key || key.length < 10) {
        statusDiv.innerHTML = '🤖 Gemini: DESLIGADO (sem chave)';
        USE_GEMINI = false;
        GEMINI_API_KEY = null;
        return false;
    }
    
    const isValid = await testGeminiKey(key);
    if (isValid) {
        GEMINI_API_KEY = key;
        USE_GEMINI = true;
        localStorage.setItem('gemini_api_key', key);
        statusDiv.innerHTML = '🤖 Gemini: CONECTADO ✓';
        
        // Mostrar alerta sobre o proxy CORS
        alert("✅ Gemini conectado!\n\nNota: Usamos um proxy CORS gratuito. Se aparecer uma mensagem do proxy, clique em 'Request temporary access' e recarregue a página.");
        
        return true;
    } else {
        statusDiv.innerHTML = '🤖 Gemini: CHAVE INVÁLIDA! Clique para tentar novamente.';
        USE_GEMINI = false;
        GEMINI_API_KEY = null;
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
            document.getElementById('apiStatus').innerHTML = '🤖 Gemini: clique para conectar';
            return false;
        }
    } else {
        document.getElementById('apiStatus').innerHTML = '🤖 Gemini: clique para conectar';
        return false;
    }
}

// ---------- CHAMAR GEMINI API COM PROXY CORS ----------
async function callGemini(promptText, context = "") {
    if (!USE_GEMINI || !GEMINI_API_KEY) {
        console.log("Gemini não disponível");
        return null;
    }
    
    const fullPrompt = context + "\n\n" + promptText + "\n\nResponda em português brasileiro, tom poético, máximo 3 frases curtas.";
    
    const requestBody = {
        contents: [{
            parts: [{
                text: fullPrompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
        }
    };
    
    // URL completa com chave
    const url = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
    
    // Tentativa 1: Sem proxy (pode falhar por CORS)
    // Tentativa 2: Com proxy (se falhar)
    
    try {
        console.log("Chamando Gemini API via proxy...");
        
        // Usar proxy CORS
        const proxyUrl = CORS_PROXY + url;
        
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro HTTP:", response.status, errorText);
            
            // Se for erro 403 ou 401, chave inválida
            if (response.status === 403 || response.status === 401) {
                localStorage.removeItem('gemini_api_key');
                USE_GEMINI = false;
                GEMINI_API_KEY = null;
                document.getElementById('apiStatus').innerHTML = '🤖 Gemini: chave expirada, clique para reconectar';
            }
            
            // Se for erro de CORS do proxy, tentar sem proxy
            if (response.status === 503 || errorText.includes('cors')) {
                console.log("Proxy falhou, tentando sem proxy...");
                return await callGeminiDirect(url, requestBody);
            }
            
            return null;
        }
        
        const data = await response.json();
        console.log("Gemini respondeu:", data);
        
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return generatedText || null;
        
    } catch (error) {
        console.error("Erro na chamada Gemini via proxy:", error);
        
        // Tentar sem proxy como fallback
        return await callGeminiDirect(url, requestBody);
    }
}

// ---------- CHAMADA DIRETA (SEM PROXY) ----------
async function callGeminiDirect(url, requestBody) {
    try {
        console.log("Tentando chamada direta (sem proxy)...");
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            console.error("Erro direto:", response.status);
            return null;
        }
        
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return generatedText || null;
        
    } catch (error) {
        console.error("Ambas tentativas falharam. CORS pode estar bloqueando.");
        console.log("💡 Dica: Instale a extensão 'Allow CORS' no Chrome ou use Firefox.");
        return null;
    }
}

// ---------- GERAR DICA DINÂMICA ----------
async function generateDynamicHint() {
    const hintDiv = document.getElementById('dynamicHint');
    const loadingSpan = document.getElementById('geminiLoading');
    
    if (!USE_GEMINI || !GEMINI_API_KEY) {
        hintDiv.innerHTML = "💡 <strong>Gemini não está conectado.</strong> Clique no status 'Gemini: clique para conectar' no topo da tela.";
        return;
    }
    
    loadingSpan.style.display = 'inline';
    hintDiv.innerHTML = "🤖 Gemini está pensando... ⏳";
    
    let prompt = "";
    let context = "";
    
    if (currentPhase === 1) {
        prompt = `Dê uma dica curta e poética (máximo 2 linhas) para decifrar uma Cifra de César onde cada letra volta 1 posição. A frase cifrada começa com "Uif tpmtujdf". Fale como Alan Turing.`;
        context = "Você é Alan Turing, cientista gay britânico. Use metáfora sobre solstício.";
    } else {
        prompt = `Dê uma dica curta e poética (máximo 2 linhas) para decifrar uma cifra onde cada letra volta 3 posições. A frase cifrada começa com "Iro vkh". Fale como Clementine, uma mulher negra ex-escravizada.`;
        context = "Você é Clementine. Use metáfora sobre liberdade e sementes.";
    }
    
    const geminiHint = await callGemini(prompt, context);
    loadingSpan.style.display = 'none';
    
    if (geminiHint) {
        hintDiv.innerHTML = `✨ <strong>DICA GERADA POR GEMINI</strong> ✨<br><br>"${geminiHint}"`;
        hintDiv.style.animation = 'glow 0.5s ease';
        setTimeout(() => { hintDiv.style.animation = ''; }, 500);
    } else {
        hintDiv.innerHTML = `💡 <strong>Dica padrão:</strong> ${currentPhase === 1 ? phase1.hint : phase2.hint}<br><br>
        ⚠️ Gemini não respondeu. Isso pode acontecer por CORS (política do navegador).<br>
        🔧 <strong>Solução rápida:</strong> 
        <ul style="margin:8px 0 0 20px;">
        <li>Use o navegador <strong>Firefox</strong> (mais permissivo com CORS)</li>
        <li>Ou instale a extensão "Allow CORS" no Chrome</li>
        <li>Ou abra o jogo em <strong>localhost</strong> ao invés de arquivo direto</li>
        </ul>`;
    }
}

// ---------- MECÂNICA DE LUZ ----------
function updateLightMechanics() {
    const slider = document.getElementById('lightSlider');
    const lightHours = parseFloat(slider.value);
    document.getElementById('lightValue').textContent = lightHours.toFixed(1);
    
    const solsticeInfo = document.getElementById('solsticeInfo');
    const lightHintSpan = document.getElementById('lightHint');
    
    if (lightHours > 18) {
        solsticeInfo.innerHTML = "🌍 HEMISFÉRIO NORTE - SOLSTÍCIO DE VERÃO ☀️<br>O dia mais longo do ano.";
        lightHintSpan.textContent = currentPhase === 1 ? phase1.lightHintLong : phase2.lightHintLong;
        canSubmit = true;
    } 
    else if (lightHours < 6) {
        solsticeInfo.innerHTML = "🌍 HEMISFÉRIO SUL - SOLSTÍCIO DE INVERNO 🌙<br>O dia mais curto.";
        lightHintSpan.textContent = currentPhase === 1 ? phase1.lightHintShort : phase2.lightHintShort;
        canSubmit = true;
    }
    else {
        solsticeInfo.innerHTML = "🌍 ENTRE SOLSTÍCIOS — Ajuste para >18h (Norte) ou <6h (Sul)";
        lightHintSpan.textContent = "⚡ Mova para o extremo para decifrar.";
        canSubmit = false;
    }
    
    document.getElementById('submitBtn').disabled = !canSubmit;
}

// ---------- DECODIFICAÇÃO ----------
function checkAnswer() {
    if (!canSubmit && !gameCompleted) {
        document.getElementById('feedback').innerHTML = '<div class="feedback error">⚠️ Mova para o solstício (>18h ou <6h).</div>';
        return;
    }
    
    const answerInput = document.getElementById('cipherAnswer');
    const userAnswer = answerInput.value.trim().toLowerCase();
    const correct = currentPuzzle.correctAnswer;
    
    if (userAnswer === correct) {
        document.getElementById('feedback').innerHTML = '<div class="feedback success">✅ CORRETO!</div>';
        
        if (currentPhase === 1) {
            document.getElementById('narrativeText').innerHTML = narratives.phase1_success;
            currentPhase = 2;
            document.getElementById('phaseNum').textContent = "2";
            document.getElementById('submitBtn').style.display = "none";
            document.getElementById('nextBtn').style.display = "inline-block";
            
            const nextBtn = document.getElementById('nextBtn');
            nextBtn.onclick = () => {
                renderPuzzle();
                document.getElementById('feedback').innerHTML = '';
                document.getElementById('submitBtn').style.display = "inline-block";
                document.getElementById('nextBtn').style.display = "none";
                document.getElementById('cipherAnswer').value = '';
                updateLightMechanics();
            };
        } 
        else if (currentPhase === 2) {
            document.getElementById('narrativeText').innerHTML = narratives.phase2_success + "\n\n🏆 PARABÉNS! Você honrou Turing, Juneteenth e o solstício. 🌈";
            document.getElementById('puzzlePanel').style.display = "none";
            document.getElementById('submitBtn').style.display = "none";
            document.getElementById('nextBtn').style.display = "none";
            document.getElementById('lightSlider').disabled = true;
            gameCompleted = true;
            document.getElementById('feedback').innerHTML = '<div class="feedback success">🏆 VITÓRIA!</div>';
        }
    } 
    else {
        document.getElementById('feedback').innerHTML = '<div class="feedback error">❌ Incorreto. Use a dica do Gemini ou veja a dica padrão.</div>';
    }
}

function renderPuzzle() {
    const puzzleTitle = document.getElementById('puzzleTitle');
    const puzzleDesc = document.getElementById('puzzleDescription');
    const cipherInterface = document.getElementById('cipherInterface');
    
    if (currentPhase === 1) {
        currentPuzzle = phase1;
        puzzleTitle.textContent = phase1.title;
        puzzleDesc.innerHTML = phase1.description;
    } else {
        currentPuzzle = phase2;
        puzzleTitle.textContent = phase2.title;
        puzzleDesc.innerHTML = phase2.description;
    }
    
    cipherInterface.innerHTML = `
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
async function initGame() {
    await loadSavedKey();
    
    const statusDiv = document.getElementById('apiStatus');
    statusDiv.style.cursor = 'pointer';
    statusDiv.onclick = configureApiKey;
    
    renderPuzzle();
    
    document.getElementById('lightSlider').addEventListener('input', updateLightMechanics);
    document.getElementById('submitBtn').addEventListener('click', () => {
        document.getElementById('checkAnswerBtn')?.click();
    });
}

// CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes glow {
        0% { text-shadow: 0 0 0px #ffd966; }
        100% { text-shadow: 0 0 8px #ffd966; }
    }
    #apiStatus:hover { background: #2a2f3e; }
`;
document.head.appendChild(style);

window.onload = initGame;