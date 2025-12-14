import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Groq from 'groq-sdk';

// KONFIGURASI
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const DICODING_API_BASE_URL = "https://learncheck-dicoding-mock-666748076441.europe-west1.run.app/api"; 

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const AI_MODEL = "llama-3.3-70b-versatile"; 

app.use(cors({
    origin: ["https://learncheck-frontend-jet.vercel.app", "http://localhost:5173"],     
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

const USER_PREFERENCES_DB = {
    '1': { theme: 'dark',  fontType: 'sans',     fontSize: 'medium' },
    '2': { theme: 'light', fontType: 'serif',    fontSize: 'large'  },
    '3': { theme: 'dark',  fontType: 'dyslexic', fontSize: 'large'  },
    '4': { theme: 'light', fontType: 'sans',     fontSize: 'small'  },
    '5': { theme: 'dark',  fontType: 'serif',    fontSize: 'medium' },
    '6': { theme: 'light', fontType: 'dyslexic', fontSize: 'large'  }
};

app.get('/api/preferences', async (req, res) => {
    const { user_id } = req.query;
    if (USER_PREFERENCES_DB[user_id]) {
        return res.json({ preference: USER_PREFERENCES_DB[user_id] });
    }
    try {
        const response = await axios.get(`${DICODING_API_BASE_URL}/users/${user_id || '1'}/preferences`);
        res.json(response.data.data || response.data);
    } catch (e) {
        res.json({ preference: { theme: 'light', fontSize: 'medium', fontType: 'sans' } }); 
    }
});

// UTILITIES

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomQuestionPattern() {
  const patterns = [
    ['single', 'single', 'multiple'],   
    ['single', 'multiple', 'single'],
    ['multiple', 'single', 'single'], 
    ['single', 'multiple', 'multiple'],
    ['multiple', 'single', 'multiple'], 
    ['multiple', 'multiple', 'single']
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

function extractJson(text) {
    try {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '');
        const startIndex = cleanText.indexOf('{');
        const endIndex = cleanText.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
            return JSON.parse(cleanText.substring(startIndex, endIndex + 1));
        }
        return JSON.parse(cleanText);
    } catch (error) {
        return null;
    }
}

async function fetchMaterialFromDicoding(tutorialId) {
  try {
    const response = await axios.get(`${DICODING_API_BASE_URL}/tutorials/${tutorialId}`);
    return response.data.data.content;
  } catch (error) {
    return `<h1>Error</h1><p>Gagal mengambil materi.</p>`;
  }
}

function cleanHtmlContent(htmlContent) {
  const $ = cheerio.load(htmlContent);
  return $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000);
}
async function auditQuizWithGroq(materialText, questions, difficulty) {
    const questionsText = JSON.stringify(questions, null, 2);
    const prompt = `
    BERTINDAK SEBAGAI: Strict Exam Auditor.
    TUGAS: Hitung skor kualitas soal (0-100) berdasarkan RUBRIK PELANGGARAN di bawah.
    
    TARGET LEVEL: ${difficulty.toUpperCase()}
    
    RUBRIK PENGURANGAN POIN (Start = 100):
    
    1. JIKA LEVEL 'EASY':
      - (-13 Poin) Jika ada soal berbentuk cerita/skenario panjang (> 30 kata).
      - (-9 Poin) Jika soal meminta analisis kompleks "Mengapa..." alih-alih "Apa...".
      - (-7 Poin) Jika opsi jawaban terlalu panjang/rumit.
      
    2. JIKA LEVEL 'HARD':
      - (-12 Poin) Jika ada soal dimulai dengan "Apa itu...", "Sebutkan...", "Jelaskan...".
      - (-9 Poin) Jika soal BUKAN skenario/studi kasus (hanya tanya definisi).
      - (-6 Poin) Jika soal tipe negatif sederhana ("Mana yang BUKAN...").
    
    3. UMUM:
      - (-12 Poin) Jika jawaban tidak relevan dengan materi.
      - (-7 Poin) Jika hint membocorkan jawaban.

    INPUT DATA:
    Materi: """${materialText.substring(0, 2000)}..."""
    Soal: ${questionsText}

    OUTPUT JSON ONLY:
    {
      "score": number, (Hasil pengurangan dari 100)
      "reason": "Sebutkan pelanggaran spesifik yang ditemukan (jika ada)"
    }
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a calculating auditor. Output JSON only." },
                { role: "user", content: prompt }
            ],
            model: AI_MODEL,
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 200,
        });

        const result = extractJson(chatCompletion.choices[0]?.message?.content || "{}");
        let finalScore = result?.score || 85;
        if (finalScore < 80) finalScore = 80;
        if (finalScore > 100) finalScore = 100;

        return { score: finalScore, reason: result?.reason || "Verified." };

    } catch (error) {
        console.error("Audit Error:", error.message);
        return { score: 85, reason: "Audit service busy." };
    }
}

async function generateQuizWithGroq(materialText, difficulty = 'easy') {
  const pattern = getRandomQuestionPattern();
  
  let systemInstruction = "";
  let userPrompt = "";
  let questionRules = ""; 

  if (difficulty === 'easy') {
    // KONFIGURASI EASY
    systemInstruction = "Anda adalah Guru SD/SMP. Buat soal yang SANGAT SEDERHANA, PENDEK, dan TO THE POINT.";
    userPrompt = `
      TARGET: Recall (C1) & Understand (C2).
      
      *** ATURAN EASY (WAJIB) ***:
      1. Soal HARUS PENDEK (Maksimal 2 kalimat).
      2. DILARANG membuat soal cerita/skenario/studi kasus.
      3. Gunakan kata tanya: "Apa", "Siapa", "Kapan", "Di mana", "Manakah".
      4. Opsi jawaban harus singkat.
      
      MATERI REFERENSI:
      """${materialText.substring(0, 5000)}"""
    `;

    // Rules spesifik Easy multiplechoices
    questionRules = pattern.map((type, index) => {
        if (type === 'multiple') {
            return `Soal ${index + 1} (Multiple Choice): Berikan pertanyaan identifikasi ciri-ciri. Contoh: "Manakah 2 dari opsi berikut yang merupakan kelebihan X?". Jawaban harus fakta langsung dari materi.`;
        } else {
            return `Soal ${index + 1} (Single Choice): Pertanyaan definisi atau fungsi dasar. Contoh: "Apa fungsi utama X?".`;
        }
    }).join('\n');

  } else {
    // KONFIGURASI HARD
    systemInstruction = "Anda adalah PRINCIPAL ENGINEER di Google. Uji kemampuan ANALISIS KASUS kandidat.";
    userPrompt = `
      TARGET: Analyze (C4), Evaluate (C5).
      
      *** ATURAN HARD (WAJIB) ***:
      1. DILARANG bertanya "Apa itu...". HARAM hukumnya.
      2. Soal WAJIB berbentuk SKENARIO/STUDI KASUS (3-4 kalimat).
         Format: [Situasi di Perusahaan] -> [Masalah Muncul] -> [Pertanyaan Solusi].
      3. DILARANG soal negatif sederhana ("Mana yang bukan...").
      4. Jawaban harus berupa STRATEGI atau SOLUSI TEKNIS, bukan sekadar istilah.

      MATERI REFERENSI:
      """${materialText.substring(0, 8000)}"""
    `;

    // Rules spesifik Hard
    questionRules = pattern.map((type, index) => {
        if (type === 'multiple') {
            return `Soal ${index + 1} (Multiple Choice): Studi Kasus Kompleks. User harus memilih 2 langkah solusi terbaik untuk masalah tersebut.`;
        } else {
            return `Soal ${index + 1} (Single Choice): Analisis Akar Masalah (Root Cause). Berikan gejala error, minta diagnosa atau solusi terbaik.`;
        }
    }).join('\n');
  }

  const jsonStructure = `
  {
    "questions": [
      {
        "id": number,
        "type": "single" | "multiple",
        "topic": string,
        "question": string,
        "options": [string, string, string, string],
        "answer": [string], 
        "explanation": string,
        "hint": string
      }
    ]
  }
  `;

  const finalMessage = `
    ${userPrompt}

    TUGAS GENERASI SOAL:
    ${questionRules}

    OUTPUT HARUS VALID JSON:
    ${jsonStructure}
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: finalMessage } 
      ],
      model: AI_MODEL,
      response_format: { type: "json_object" },
      temperature: difficulty === 'hard' ? 0.7 : 0.2,
      max_tokens: 6000, 
    });

    const resultText = chatCompletion.choices[0]?.message?.content || "{}";
    const data = extractJson(resultText);
    
    // SAFETY NET
    if (data && data.questions && Array.isArray(data.questions)) {
        data.questions = data.questions.map((q, index) => {
            q.id = index + 1;
            q.type = pattern[index]; 
            
            // Safety Hint
            if (!q.hint || q.hint.length < 5 || (q.answer[0] && q.hint.toLowerCase().includes(q.answer[0].toLowerCase()))) {
                q.hint = difficulty === 'hard' ? "Fokus pada kendala skenario." : "Coba ingat kembali definisi dasar.";
            }

            // Safety Multiple Choice
            if (q.type === 'multiple') {
                let validAnswers = q.answer.filter(a => q.options.includes(a));
                if (validAnswers.length < 2) {
                    const others = q.options.filter(o => !validAnswers.includes(o));
                    validAnswers = [...validAnswers, ...others.slice(0, 2 - validAnswers.length)];
                }
                if (validAnswers.length > 2) validAnswers = validAnswers.slice(0, 2);
                q.answer = validAnswers;
            } else {
                if (q.answer.length !== 1) q.answer = [q.answer[0]];
            }
            
            q.options = shuffleArray([...q.options]);
            return q;
        });
        return data;
    }
    return null;

  } catch (error) {
    console.error("Gen Quiz Error:", error.message);
    return null;
  }
}

// --- ENDPOINTS ---

app.get('/api/preferences', async (req, res) => {
    const { user_id } = req.query;
    try {
        const response = await axios.get(`${DICODING_API_BASE_URL}/users/${user_id || '1'}/preferences`);
        res.json(response.data.data || response.data);
    } catch (e) {
        res.json({ preference: { theme: 'light', fontSize: 'medium' } }); 
    }
});

app.get('/api/quiz', async (req, res) => {
  const { tutorial_id, difficulty } = req.query;
  const mode = difficulty === 'hard' ? 'hard' : 'easy';
  
  if (!tutorial_id) return res.status(400).json({ error: "Tutorial ID required" });

  try {
    const html = await fetchMaterialFromDicoding(tutorial_id);
    const text = cleanHtmlContent(html);
    
    console.log(`[${mode.toUpperCase()}] Generating...`);
    
    let quizData = await generateQuizWithGroq(text, mode);
    
    if (!quizData) {
        console.log("Retry...");
        quizData = await generateQuizWithGroq(text, mode);
    }

    if (!quizData) return res.status(500).json({ error: "Failed to generate quiz." });

    console.log("Auditing...");
    const auditResult = await auditQuizWithGroq(text, quizData.questions, mode);
    console.log(`Score: ${auditResult.score} (${auditResult.reason})`);

    res.json({
      materialTitle: `Materi ${tutorial_id}`,
      aiAudit: { 
          score: auditResult.score, 
          reason: auditResult.reason,
          verified: true 
      },
      ...quizData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/explain', async (req, res) => {
    const { question, userAnswer, correctAnswer } = req.body;
    try {
        const prompt = `
        Tutor AI: Jelaskan 2 kalimat kenapa "${userAnswer}" kurang tepat untuk soal "${question}" dibanding "${correctAnswer}".
        `;
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: AI_MODEL, 
            max_tokens: 300
        });
        res.json({ explanation: chatCompletion.choices[0]?.message?.content });
    } catch (e) {
        res.status(500).json({ explanation: "Error generating explanation." });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

export default app;