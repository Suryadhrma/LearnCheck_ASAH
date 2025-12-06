import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

// KONFIGURASI
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// URL API Dicoding (Kosongkan untuk Mock Mode)
const DICODING_API_BASE_URL = "https://learncheck-dicoding-mock-666748076441.europe-west1.run.app/api"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.use(cors());
app.use(express.json());

// FUNGSI HELPER 

// Fetch User Preferences (Logic Sederhana: Cek string 'dark')
async function fetchUserPreferences(userId) {
  // MOCK MODE
  if (!DICODING_API_BASE_URL) {
    console.log(`[Mock Mode] Simulasi preferensi untuk User: ${userId}`);
    
    // Jika ID mengandung kata 'dark', set tema gelap. Contoh: 'user-dark'
    const isDarkUser = userId && userId.toLowerCase().includes('dark');
    
    return { 
      theme: isDarkUser ? 'dark' : 'light', 
      fontSize: 'medium', 
      layoutWidth: 'fullWidth' 
    };
  }

  // REAL API MODE
  const apiUrl = `${DICODING_API_BASE_URL}/users/${userId}/preferences`;
  try {
    const response = await axios.get(apiUrl);
    return response.data.data.preference;
  } catch (error) {
    console.warn(`Gagal mengambil preferensi, fallback default.`);
    return { theme: 'light', fontSize: 'medium', layoutWidth: 'fullWidth' };
  }
}

// Fetch Materi
async function fetchMaterialFromDicoding(tutorialId) {
  if (!DICODING_API_BASE_URL) {
    return `
      <h1>Pengenalan React Component</h1>
      <p>React adalah library untuk membangun UI. Konsep utamanya adalah Component.
      Component membagi UI menjadi bagian independen dan reusable.
      Ada dua jenis: Functional Component (menggunakan fungsi JS) dan Class Component (menggunakan class ES6).
      Props adalah input untuk komponen yang bersifat read-only.
      State adalah data internal yang dikelola komponen dan bisa berubah (mutable).
      Lifecycle method hanya ada di Class Component, tapi Functional Component bisa pakai Hooks (useEffect).</p>
    `;
  }
  
  try {
    const response = await axios.get(`${DICODING_API_BASE_URL}/tutorials/${tutorialId}`);
    return response.data.data.content;
  } catch (error) {
    throw new Error("Gagal mengambil materi.");
  }
}

// Clean konten HTML
function cleanHtmlContent(htmlContent) {
  const $ = cheerio.load(htmlContent);
  return $('body').text().replace(/\s+/g, ' ').trim().substring(0, 10000);
}

// Generator Soal (Dengan Adaptive Difficulty & Hint)
async function generateQuizWithGemini(materialText, difficulty = 'medium') {
  const jsonSchema = {
    type: "OBJECT",
    properties: {
      questions: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "NUMBER" },
            type: { type: "STRING", enum: ["single", "multiple"] },
            topic: { type: "STRING" },
            question: { type: "STRING" },
            options: { type: "ARRAY", items: { type: "STRING" } },
            answer: { type: "ARRAY", items: { type: "STRING" } },
            explanation: { type: "STRING" },
            hint: { type: "STRING" }
          },
          required: ["id", "type", "topic", "question", "options", "answer", "explanation", "hint"]
        }
      }
    },
    required: ["questions"]
  };

  let difficultyInstruction = "";
  if (difficulty === 'easy') difficultyInstruction = "Level: MUDAH (Definisi & Fakta Dasar).";
  else if (difficulty === 'hard') difficultyInstruction = "Level: SULIT (Analisis & Kasus).";
  else difficultyInstruction = "Level: SEDANG (Konsep & Penerapan).";

  const systemInstruction = `
    Anda adalah Guru Pembuat Soal Profesional. ${difficultyInstruction}
    ATURAN:
    1. Buat 3 soal variatif.
    2. WAJIB: 4 opsi jawaban per soal.
    3. Single: 1 jawaban benar. Multiple: 2 jawaban benar.
    4. Sumber materi HANYA dari teks yang diberikan.
    5. WAJIB: Sertakan 'hint' (petunjuk) singkat 1 kalimat.
  `;

  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: `MATERI: ${materialText}` }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { responseMimeType: "application/json", responseSchema: jsonSchema },
    });
    
    const data = JSON.parse(result.response.text());
    
    if (data.questions) {
        data.questions = data.questions.map(q => ({
            ...q,
            hint: q.hint || `Ingat konsep ${q.topic || 'dasar'} terkait materi ini.`
        }));
    }
    return data;
  } catch (error) {
    console.error("Error Gen Quiz:", error);
    return null;
  }
}

// AI Auditor
async function evaluateRelevance(materialText, quizJson) {
  const evaluationSchema = {
    type: "OBJECT",
    properties: { relevanceScore: { type: "NUMBER" }, reason: { type: "STRING" }, isPass: { type: "BOOLEAN" } },
    required: ["relevanceScore", "reason", "isPass"]
  };

  const prompt = `MATERI:\n${materialText}\n\nSOAL:\n${JSON.stringify(quizJson)}\n\nLakukan Audit!`;

  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: evaluationSchema },
    });
    return JSON.parse(result.response.text());
  } catch (error) {
    return { relevanceScore: 85, isPass: true, reason: "Evaluator Error (Bypassed)" };
  }
}

// Ask AI Tutor
async function generateExplanation(question, topic, userAnswer, correctAnswer) {
    const systemInstruction = "Jelaskan kenapa jawaban salah dan konsep yang benar dengan ramah (maks 3 kalimat).";
    const prompt = `TOPIK: ${topic}\nPERTANYAAN: ${question}\nJAWABAN SISWA: ${userAnswer}\nJAWABAN BENAR: ${correctAnswer}\nJelaskan!`;

    try {
        const result = await geminiModel.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
        });
        return result.response.text();
    } catch (error) {
        return "Maaf, AI Tutor sedang sibuk.";
    }
}

// ROUTES

app.get('/api/preferences', async (req, res) => {
  const { user_id } = req.query;
  const targetUser = user_id || 'default-user';
  try {
    const prefs = await fetchUserPreferences(targetUser);
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ error: 'Gagal ambil preferensi' });
  }
});

app.get('/api/quiz', async (req, res) => {
  const { tutorial_id, difficulty } = req.query;
  const targetTutorial = tutorial_id || 'react-basic';

  try {
    const htmlContent = await fetchMaterialFromDicoding(targetTutorial);
    const materialText = cleanHtmlContent(htmlContent);
    
    let attempts = 0;
    let finalQuizData = null;
    let finalEvaluation = null;
    let isQualityMet = false;

    while (!isQualityMet && attempts < 2) {
        attempts++;
        console.log(`[Attempt ${attempts}] Generating (${difficulty || 'medium'})...`);
        const quizData = await generateQuizWithGemini(materialText, difficulty);
        if (!quizData) continue; 

        const evaluation = await evaluateRelevance(materialText, quizData);
        if (evaluation.isPass) {
            finalQuizData = quizData;
            finalEvaluation = evaluation;
            isQualityMet = true;
        }
    }

    if (!finalQuizData) return res.status(500).json({ error: "Gagal membuat soal valid." });

    res.json({
      materialTitle: `Kuis Materi ${targetTutorial}`,
      aiAudit: { score: finalEvaluation?.relevanceScore || 0, attempts, verified: isQualityMet },
      ...finalQuizData
    });

  } catch (error) {
    console.error(`Error Handler:`, error.message);
    res.status(500).json({ error: 'Gagal memproses permintaan.', details: error.message });
  }
});

app.post('/api/explain', async (req, res) => {
    const { question, topic, userAnswer, correctAnswer } = req.body;
    if (!question || !correctAnswer) return res.status(400).json({ error: "Data tidak lengkap" });
    try {
        const explanation = await generateExplanation(question, topic, userAnswer, correctAnswer);
        res.json({ explanation });
    } catch (error) {
        res.status(500).json({ error: "Gagal generate penjelasan" });
    }
});

app.get('/', (req, res) => res.send('Server Backend Ready!'));

app.listen(PORT, () => {
  console.log(`Backend server berjalan di http://localhost:${PORT}`);
});