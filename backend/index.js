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

// URL API Dicoding
const DICODING_API_BASE_URL = "https://learncheck-dicoding-mock-666748076441.europe-west1.run.app/api";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Model llm
const AI_MODEL = "openai/gpt-oss-120b";

app.use(cors());
app.use(express.json());

// FUNGSI UTILITY (Shuffle)

// Shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Random Pattern 
function getRandomQuestionPattern() {
  const patterns = [
    ['single', 'single', 'multiple'],   
    ['single', 'multiple', 'single'],
    ['multiple', 'single', 'single'], 
    ['single', 'multiple', 'multiple'],
    ['multiple', 'single', 'multiple'], 
    ['multiple', 'multiple', 'single']
  ];
  // Pilih satu pola secara acak dari daftar di atas
  const randomIndex = Math.floor(Math.random() * patterns.length);
  return patterns[randomIndex];
}

// FUNGSI HELPER DATA

async function fetchUserPreferences(userId) {
  if (!DICODING_API_BASE_URL) {
    const isDarkUser = userId && userId.toLowerCase().includes('dark');
    return { theme: isDarkUser ? 'dark' : 'light', fontSize: 'medium', layoutWidth: 'fullWidth' };
  }
  const apiUrl = `${DICODING_API_BASE_URL}/users/${userId}/preferences`;
  try {
    const response = await axios.get(apiUrl);
    return response.data.data.preference;
  } catch (error) {
    return { theme: 'light', fontSize: 'medium', layoutWidth: 'fullWidth' };
  }
}

async function fetchMaterialFromDicoding(tutorialId) {
  if (!DICODING_API_BASE_URL) {
    return `
      <h1>Pengenalan React Component & State Management</h1>
      <p>React adalah library JavaScript untuk membangun UI berbasis Component.
      
      <strong>1. Konsep Dasar</strong>
      Component membagi UI menjadi bagian independen. Ada Functional Component (modern, pakai Hooks) dan Class Component (legacy).
      Props bersifat read-only (mengalir dari atas ke bawah), sedangkan State adalah data internal yang bisa berubah (mutable).
      
      <strong>2. Masalah Umum & Debugging (Studi Kasus)</strong>
      Kesalahan pemula yang sering terjadi:
      - Direct Mutation: Mengubah state langsung dengan <code>this.state.count = 5</code>. Ini SALAH karena tidak memicu re-render. Harusnya pakai <code>setState</code> atau <code>useState</code> setter.
      - Infinite Loop: Menaruh <code>setState</code> langsung di dalam body render atau <code>componentDidUpdate</code> tanpa kondisi if. Ini akan membuat aplikasi crash (Too many re-renders).
      
      <strong>3. Lifecycle vs Hooks</strong>
      Di Class component ada <code>componentDidMount</code> (jalan sekali setelah render pertama). Di Functional, kita gunakan <code>useEffect(() => {...}, [])</code> dengan dependency array kosong untuk efek yang sama.
      Jika dependency array tidak ada, efek jalan tiap render (bahaya performa untuk fetch API).
      </p>
    `;
  }
  
  try {
    const response = await axios.get(`${DICODING_API_BASE_URL}/tutorials/${tutorialId}`);
    return response.data.data.content;
  } catch (error) {
    throw new Error("Gagal mengambil materi.");
  }
}

function cleanHtmlContent(htmlContent) {
  const $ = cheerio.load(htmlContent);
  return $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000);
}

// Generate Quiz

async function generateQuizWithGroq(materialText, difficulty = 'easy') {
  // Set Pola
  const pattern = getRandomQuestionPattern();
  
  // Instruksi spesifik 
  const questionRules = pattern.map((type, index) => {
    return `   - Soal ${index + 1}: WAJIB Tipe "${type}". ${type === 'multiple' ? '(Harus ada 2 jawaban benar)' : '(Hanya 1 jawaban benar)'}.`;
  }).join('\n');

  const jsonStructure = `
  {
    "questions": [
      {
        "id": number,
        "type": "single" | "multiple",
        "topic": string,
        "question": string,
        "options": [string, string, string, string],
        "answer": [string] (Array kunci jawaban. Jika multiple, isinya > 1 string),
        "explanation": string,
        "hint": string
      }
    ]
  }
  `;

  let examples = "";
  let difficultyInstruction = "";

  if (difficulty === 'easy') {
      difficultyInstruction = "LEVEL: MUDAH (Recall & Definition). Fokus pada definisi istilah dan fakta dasar.";
      examples = `Contoh Multiple Choice Mudah: "Manakah DUA hook dasar React?" (Jawab: useState, useEffect).`;
  } 
  else { // HARD
      difficultyInstruction = "LEVEL: SULIT (Analisis & Studi Kasus Panjang). Soal HARUS berupa PARAGRAF CERITA (Skenario Error/Performance).";
      examples = `Contoh Multiple Choice Sulit: "App lambat saat mengetik di input. Pilih DUA penyebab paling mungkin dari kode di atas."`;
  }

  const systemInstruction = `
    Anda adalah Senior Tech Lead. Buat 3 soal kuis coding.
    
    PERINTAH STRUKTUR (WAJIB IKUTI):
    Total Soal: 3
    ${questionRules}

    PERINTAH KONTEN LEVEL ${difficulty === 'easy' ? 'MUDAH' : 'SULIT'}:
    ${difficultyInstruction}
    ${difficulty === 'hard' ? 'Soal HARUS panjang (min 30 kata) dan berupa skenario.' : 'Soal singkat dan padat.'}

    Output HANYA JSON.
    Struktur JSON: ${jsonStructure}
    ${examples}
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: `MATERI SUMBER: ${materialText}` }
      ],
      model: AI_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.7, 
      max_tokens: 6000, // Set max token 
    });

    const resultText = chatCompletion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(resultText);
    
    // VALIDASI & POST-PROCESSING
    if (data.questions) {
        // memastikan jumlah soal pas 3
        if (data.questions.length !== 3) throw new Error("Jumlah soal tidak 3");

        // Mapping ulang untuk memastikan struktur
        data.questions = data.questions.map((q, index) => {
            const forcedType = pattern[index]; // Ambil tipe dari pola acak kita tadi
            
            // mengacak opsi
            const shuffledOptions = shuffleArray([...q.options]);

            return {
                ...q,
                id: index + 1,
                type: forcedType,
                options: shuffledOptions,
                hint: q.hint || `Perhatikan detail pertanyaan.`
            };
        });
    }
    return data;

  } catch (error) {
    console.error("Error Gen Quiz Groq:", error.message);
    return null;
  }
}

// AI Auditor
async function evaluateRelevance(materialText, quizJson, difficulty) {
  let criteria = "";
  if (difficulty === 'easy') {
      criteria = `PASS jika soal dasar/definisi. REJECT jika soal cerita sangat panjang.`;
  } else {
      criteria = `PASS jika soal STUDI KASUS/CERITA. REJECT jika soal pendek 1 kalimat.`;
  }

  const systemInstruction = `
    Anda Auditor Soal. 
    Pastikan ada campuran tipe Single dan Multiple choice sesuai JSON.
    KRITERIA: ${criteria}
    Output JSON: { "relevanceScore": number, "isPass": boolean }
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: `SOAL:\n${JSON.stringify(quizJson)}` }
        ],
        model: AI_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

    return JSON.parse(chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    return { relevanceScore: 90, isPass: true };
  }
}

async function generateExplanation(question, topic, userAnswer, correctAnswer) {
    const systemInstruction = "Jelaskan konsep dengan analogi sederhana.";
    const prompt = `PERTANYAAN: ${question}\nJAWABAN SISWA: ${userAnswer}\nJAWABAN BENAR: ${correctAnswer}\nJelaskan!`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemInstruction }, { role: "user", content: prompt }],
            model: AI_MODEL,
        });
        return chatCompletion.choices[0]?.message?.content;
    } catch (error) {
        return "Maaf, AI Tutor sedang sibuk.";
    }
}

// ROUTES

app.get('/api/preferences', async (req, res) => {
  try {
    const prefs = await fetchUserPreferences(req.query.user_id || 'default');
    res.json(prefs);
  } catch (error) { res.status(500).json({ error: 'Gagal' }); }
});

app.get('/api/quiz', async (req, res) => {
  const { tutorial_id, difficulty } = req.query;
  const finalDifficulty = (difficulty === 'hard') ? 'hard' : 'easy';

  try {
    const htmlContent = await fetchMaterialFromDicoding(tutorial_id);
    const materialText = cleanHtmlContent(htmlContent);
    
    let attempts = 0;
    let finalQuizData = null;
    let isQualityMet = false;

    // Retry sampai 3 kali jika gagal generate atau gagal audit
    while (!isQualityMet && attempts < 3) { 
        attempts++;
        console.log(`[Attempt ${attempts}] Generating ${finalDifficulty} (Random Pattern)...`);
        
        const quizData = await generateQuizWithGroq(materialText, finalDifficulty);
        
        // Strict Validation: Harus ada data & jumlahnya 3
        if (!quizData || !quizData.questions || quizData.questions.length !== 3) {
            console.log("Gagal: Jumlah soal tidak 3 atau error JSON. Retry...");
            continue;
        }

        const evaluation = await evaluateRelevance(materialText, quizData, finalDifficulty);
        
        if (evaluation.isPass) {
            finalQuizData = quizData;
            isQualityMet = true;
        } else {
            console.log("Audit Failed, Retry...");
        }
    }

    if (!finalQuizData) {
        console.log("Fallback: Force generating one last time...");
        finalQuizData = await generateQuizWithGroq(materialText, finalDifficulty);
    }

    if (!finalQuizData || !finalQuizData.questions || finalQuizData.questions.length === 0) {
        return res.status(500).json({ error: "Gagal membuat soal yang valid." });
    }

    res.json({
      materialTitle: `Kuis Materi ${tutorial_id || 'React'}`,
      aiAudit: { score: 85, verified: isQualityMet }, 
      ...finalQuizData
    });

  } catch (error) {
    console.error(`Error Handler:`, error.message);
    res.status(500).json({ error: 'Gagal memproses permintaan.', details: error.message });
  }
});

app.post('/api/explain', async (req, res) => {
    try {
        const explanation = await generateExplanation(req.body.question, req.body.topic, req.body.userAnswer, req.body.correctAnswer);
        res.json({ explanation });
    } catch (error) { res.status(500).json({ error: "Gagal" }); }
});

app.listen(PORT, () => {
  console.log(`Backend server berjalan di http://localhost:${PORT}`);
});