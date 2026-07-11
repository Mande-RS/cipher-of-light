// ============================================
// THE CIPHER OF THE LONGEST LIGHT
// Game Jam Solstício 2025 - 3 FASES
// ============================================

// ---------- ESTADO DO JOGO ----------
let currentPhase = 1;  // 1, 2 ou 3
let currentPuzzle = null;
let canSubmit = false;
let gameCompleted = false;

// ---------- DADOS DOS PUZZLES ----------
// FASE 1: Cifra de César (homenagem a Turing)
const phase1 = {
    title: "🔐 A CARTA DE ALAN TURING",
    description: "Você encontrou um bilhete cifrado no diário de Turing. Ele escreveu:\n\n\"Uif tpmtujdf jt nz pof ujnf pg mjhiu.\"\n\nTuring usava Cifra de César (deslocamento de 1 letra para trás). Decifre a mensagem.",
    encryptedText: "Uif tpmtujdf jt nz pof ujnf pg mjhiu.",
    correctAnswer: "the solstice is my one time of light",
    hint: "U→T, i→h, f→e... volte uma letra no alfabeto.",
    lightHintShort: "Pouca luz → as sombras escondem a letra 'A'?",
    lightHintLong: "Muita luz → Turing amava o dia mais longo."
};

// FASE 2: Cifra de substituição (Clementine - Juneteenth)
const phase2 = {
    title: "📜 A CARTA DE CLEMENTINE (Juneteenth, 1865)",
    description: "Clementine, uma mulher negra libertada, deixou um código. Cada letra foi deslocada 3 posições (A→D, B→E...).\n\nMensagem: \"Iro vkh dqg ri wkh fkdlqv duh jrqh, exw iuhhgrp lv d vhhg.\"",
    encryptedText: "Iro vkh dqg ri wkh fkdlqv duh jrqh, exw iuhhgrp lv d vhhg.",
    correctAnswer: "all the end of the chains are gone but freedom is a seed",
    hint: "D→A, E→B, F→C... (deslocamento 3 para trás)",
    lightHintShort: "No dia mais curto: 'A escuridão me ensinou a ver estrelas'.",
    lightHintLong: "No dia mais longo: 'A luz da verdade não pode ser apagada'."
};

// FASE 3: Teste de Turing + Orgulho LGBTQIA+
const phase3 = {
    title: "🤖 O TESTE DE TURING (1950)",
    description: "Último arquivo encontrado. Turing propôs um teste para identificar se uma máquina pode pensar. Mas ele também deixou uma mensagem sobre sua própria identidade.\n\nMensagem cifrada (A=1, B=2...):\n\n\"19 15 12 19 20 9 3 9 15 21 19 5 19 20 1 18 19 23 9 20 8 12 15 22 5\"\n\nDecifre os números (A=1, B=2... Z=26) para encontrar a mensagem final de Turing sobre o solstício e o orgulho.",
    encryptedText: "19 15 12 19 20 9 3 9 15 21 19 5 19 20 1 18 19 23 9 20 8 12 15 22 5",
    correctAnswer: "solstice starts with love",
    hint: "A=1, B=2, C=3... 19=S, 15=O, 12=L...",
    lightHintShort: "No dia mais curto, Turing escreveu: 'O amor não precisa de luz para existir'.",
    lightHintLong: "No dia mais longo, ele disse: 'Seja autêntico, mesmo que o mundo tente te decifrar'."
};

// ---------- NARRATIVAS ----------
const narratives = {
    phase1_intro: "📜 *Arquivo Desclassificado - Solstício de 2025*\n\nVocê encontra um baú esquecido. Dentro: o diário de Alan Turing e cartas de Clementine, que se correspondia com ele em 1947.\n\nTuring escreveu: 'Guarde isto para o solstício. Só quando o dia for extremo, a luz revelará o código.'",
    
    phase1_success: "✨ *Mensagem decifrada:* 'The solstice is my one time of light.'\n\nTuring: 'O solstício era o único dia em que eu não me sentia vigiado. A luz me lembrava que existia um amanhã.'\n\nVocê encontra um bilhete: 'Alan, a liberdade não chegou para mim em 1865 de verdade. Mas plantei uma semente.'",
    
    phase2_intro: "🔍 A segunda cifra está nas cartas de Clementine.\n\n'Juneteenth foi um começo, não um fim. Meu povo sabe que a corrente maior é a que prende a mente.'\n\nDecifre para libertar o próximo arquivo.",
    
    phase2_success: "🌟 *Decifrado:* 'All the end of the chains are gone but freedom is a seed.'\n\nClementine: 'Quebrar códigos é como quebrar correntes. Continue.'",
    
    phase3_intro: "🤖 *O ÚLTIMO TESTE DE TURING*\n\nVocê encontra uma fita magnética com números. Turing desafiou o mundo com seu teste de IA. Mas esta mensagem é pessoal.\n\n'Se uma máquina pode pensar, por que um homem não pode amar outro?'\n\nDecifre os números (A=1, B=2...).",
    
    phase3_success: "💜 *Mensagem final:* 'SOLSTICE STARTS WITH LOVE'\n\nTuring escreveu: 'O amor não escolhe estação. Nem o solstício escolhe hemisfério. Seja luz ou escuridão, seja amor. Fui condenado por ser quem sou, mas meu código jamais será quebrado.'\n\n🌈 *Clementine adiciona:* 'E eu, que fui escravizada, aprendi: a maior liberdade é ser dona da própria história.'\n\n📁 ARQUIVO FINAL:\n\n'Para quem joga no solstício: a luz e a escuridão não são opostas. São ritmos. O orgulho não existe sem luta. A liberdade não existe sem memória. Que você celebre quem é e nunca pare de decifrar o mundo.'\n\n🏆 VITÓRIA! Você honrou Alan Turing, Juneteenth e o espírito LGBTQIA+ do solstício. 🌈✨",
    
    phase3_success_lgbt: "\n\n🏳️‍🌈 *Alan Turing (1912-1954):* Cientista, herói de guerra, pai da computação. Condenado por ser gay em 1952. Perdoado postumamente em 2013. O solstício nos lembra: até o dia mais curto tem um amanhecer."
};

// ---------- DECODIFICADORES ----------
function caesarDecrypt(text, shift = 1) {
    return text.split('').map(char => {
        if (char >= 'a' && char <= 'z') {
            let code = char.charCodeAt(0) - shift;
            if (code < 'a'.charCodeAt(0)) code += 26;
            return String.fromCharCode(code);
        }
        if (char >= 'A' && char <= 'Z') {
            let code = char.charCodeAt(0) - shift;
            if (code < 'A'.charCodeAt(0)) code += 26;
            return String.fromCharCode(code);
        }
        return char;
    }).join('');
}

function substitutionDecrypt(text, shift = 3) {
    return text.split('').map(char => {
        if (char >= 'a' && char <= 'z') {
            let code = char.charCodeAt(0) - shift;
            if (code < 'a'.charCodeAt(0)) code += 26;
            return String.fromCharCode(code);
        }
        if (char >= 'A' && char <= 'Z') {
            let code = char.charCodeAt(0) - shift;
            if (code < 'A'.charCodeAt(0)) code += 26;
            return String.fromCharCode(code);
        }
        return char;
    }).join('');
}

function numberToLetterDecrypt(numberString) {
    // Converte "19 15 12..." para letras
    const numbers = numberString.trim().split(/\s+/);
    let result = "";
    for (let num of numbers) {
        const n = parseInt(num);
        if (n >= 1 && n <= 26) {
            result += String.fromCharCode(96 + n);
        } else {
            result += " ";
        }
    }
    return result;
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
        if (currentPhase === 1) lightHintSpan.textContent = phase1.lightHintLong;
        else if (currentPhase === 2) lightHintSpan.textContent = phase2.lightHintLong;
        else if (currentPhase === 3) lightHintSpan.textContent = phase3.lightHintLong;
        canSubmit = true;
    } 
    else if (lightHours < 6) {
        solsticeInfo.innerHTML = "🌍 HEMISFÉRIO SUL - SOLSTÍCIO DE INVERNO 🌙<br>O dia mais curto.";
        if (currentPhase === 1) lightHintSpan.textContent = phase1.lightHintShort;
        else if (currentPhase === 2) lightHintSpan.textContent = phase2.lightHintShort;
        else if (currentPhase === 3) lightHintSpan.textContent = phase3.lightHintShort;
        canSubmit = true;
    }
    else {
        solsticeInfo.innerHTML = "🌍 ENTRE SOLSTÍCIOS — Ajuste para >18h (Norte) ou <6h (Sul)";
        lightHintSpan.textContent = "⚡ O solstício é necessário para decifrar.";
        canSubmit = false;
    }
    
    document.getElementById('submitBtn').disabled = !canSubmit;
    
    if (!canSubmit) {
        document.getElementById('puzzleDescription').innerHTML = currentPuzzle.description + "<br><br>💡 <strong>Dica:</strong> Mova o slider para o extremo (>18h ou <6h).";
    }
}

// ---------- MOSTRAR PUZZLE ----------
function renderPuzzle() {
    const puzzleTitle = document.getElementById('puzzleTitle');
    const puzzleDesc = document.getElementById('puzzleDescription');
    const cipherInterface = document.getElementById('cipherInterface');
    const narrativeText = document.getElementById('narrativeText');
    
    if (currentPhase === 1) {
        currentPuzzle = phase1;
        puzzleTitle.textContent = phase1.title;
        puzzleDesc.innerHTML = phase1.description;
        narrativeText.innerHTML = narratives.phase1_intro;
        
        cipherInterface.innerHTML = `
            <div class="cipher-input">
                <input type="text" id="cipherAnswer" placeholder="Digite a mensagem decifrada (minúsculas)..." style="flex:2;">
                <button id="checkAnswerBtn">🔍 VERIFICAR</button>
            </div>
            <p style="font-size:0.8rem; color:#aaa;">💡 Dica: ${phase1.hint}</p>
            <p style="font-size:0.8rem;">🔢 Cifrado: <strong>${phase1.encryptedText}</strong></p>
        `;
    } 
    else if (currentPhase === 2) {
        currentPuzzle = phase2;
        puzzleTitle.textContent = phase2.title;
        puzzleDesc.innerHTML = phase2.description;
        narrativeText.innerHTML = narratives.phase2_intro;
        
        cipherInterface.innerHTML = `
            <div class="cipher-input">
                <input type="text" id="cipherAnswer" placeholder="Digite a mensagem decifrada (minúsculas)..." style="flex:2;">
                <button id="checkAnswerBtn">🔍 VERIFICAR</button>
            </div>
            <p style="font-size:0.8rem; color:#aaa;">💡 Dica: ${phase2.hint}</p>
            <p style="font-size:0.8rem;">🔢 Cifrado: <strong>${phase2.encryptedText}</strong></p>
        `;
    }
    else if (currentPhase === 3) {
        currentPuzzle = phase3;
        puzzleTitle.textContent = phase3.title;
        puzzleDesc.innerHTML = phase3.description;
        narrativeText.innerHTML = narratives.phase3_intro;
        
        cipherInterface.innerHTML = `
            <div class="cipher-input">
                <input type="text" id="cipherAnswer" placeholder="Digite a mensagem decifrada (minúsculas)..." style="flex:2;">
                <button id="checkAnswerBtn">🔍 VERIFICAR</button>
            </div>
            <p style="font-size:0.8rem; color:#aaa;">💡 Dica: ${phase3.hint}</p>
            <p style="font-size:0.8rem;">🔢 Números: <strong>${phase3.encryptedText}</strong></p>
            <p style="font-size:0.75rem; color:#888;">🔧 Conversor: 1=A, 2=B, 3=C... 26=Z</p>
        `;
    }
    
    setTimeout(() => {
        const checkBtn = document.getElementById('checkAnswerBtn');
        if (checkBtn) checkBtn.addEventListener('click', checkAnswer);
    }, 50);
    
    updateLightMechanics();
}

// ---------- VERIFICAR RESPOSTA ----------
function checkAnswer() {
    if (!canSubmit && !gameCompleted) {
        document.getElementById('feedback').innerHTML = '<div class="feedback error">⚠️ Mova para o solstício (>18h ou <6h).</div>';
        return;
    }
    
    const answerInput = document.getElementById('cipherAnswer');
    let userAnswer = answerInput.value.trim().toLowerCase();
    const correct = currentPuzzle.correctAnswer;
    
    // Para fase 3, também aceitar com espaços ou sem
    if (currentPhase === 3) {
        userAnswer = userAnswer.replace(/\s+/g, ' ').trim();
    }
    
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
            document.getElementById('narrativeText').innerHTML = narratives.phase2_success;
            currentPhase = 3;
            document.getElementById('phaseNum').textContent = "3";
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
        else if (currentPhase === 3) {
            document.getElementById('narrativeText').innerHTML = narratives.phase3_success + narratives.phase3_success_lgbt;
            document.getElementById('puzzlePanel').style.display = "none";
            document.getElementById('submitBtn').style.display = "none";
            document.getElementById('nextBtn').style.display = "none";
            document.getElementById('lightSlider').disabled = true;
            gameCompleted = true;
            
            document.getElementById('feedback').innerHTML = '<div class="feedback success">🏆 PARABÉNS! Você completou as 3 fases. 🌈✨</div>';
        }
    } 
    else {
        document.getElementById('feedback').innerHTML = '<div class="feedback error">❌ Incorreto. Tente novamente. Use a dica e ajuste a luz.</div>';
        
        // Ajuda extra para fase 3
        if (currentPhase === 3) {
            const hint = numberToLetterDecrypt(phase3.encryptedText);
            document.getElementById('feedback').innerHTML += `<div style="font-size:0.8rem; margin-top:8px;">🔍 Conversão parcial: "${hint.substring(0, 15)}..."</div>`;
        }
    }
}

// ---------- INICIALIZAR ----------
function initGame() {
    renderPuzzle();
    
    const slider = document.getElementById('lightSlider');
    slider.addEventListener('input', updateLightMechanics);
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', () => {
        const checkBtn = document.getElementById('checkAnswerBtn');
        if (checkBtn) checkAnswer();
    });
}

window.onload = initGame;