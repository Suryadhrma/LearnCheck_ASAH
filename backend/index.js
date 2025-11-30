import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- KONFIGURASI AWAL ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const DICODING_API_BASE_URL = "https://learncheck-dicoding-mock-666748076441.europe-west1.run.app/api";

// Menggunakan Model Stabil
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // Menggunakan 1.5 flash yang lebih cepat/murah (atau tetap 2.5 jika akses ada)
});

app.use(cors());
app.use(express.json());

// --- FUNGSI HELPER ---

async function fetchMaterialFromDicoding(tutorialId) {
  const apiUrl = `${DICODING_API_BASE_URL}/tutorials/${tutorialId}`;
  console.log(`[Dicoding API] Fetching Material: ${apiUrl}`);
  try {
    const response = await axios.get(apiUrl);
    return response.data.data.content;
  } catch (error) {
    console.error(`Error fetch materi: ${error.message}`);
    if (error.response && error.response.status === 404) {
      throw new Error(`Materi dengan tutorial_id ${tutorialId} tidak ditemukan.`);
    }
    throw new Error("Gagal mengambil materi dari API Dicoding.");
  }
}

async function fetchUserPreferences(userId) {
  const apiUrl = `${DICODING_API_BASE_URL}/users/${userId}/preferences`;
  console.log(`[Dicoding API] Fetching Preferences: ${apiUrl}`);
  try {
    const response = await axios.get(apiUrl);
    return response.data.data.preference;
  } catch (error) {
    console.warn(`Gagal mengambil preferensi user ${userId}, menggunakan default.`);
    return { theme: 'light', fontSize: 'medium', layoutWidth: 'fullWidth' };
  }
}

function cleanHtmlContent(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  if (!text) throw new Error("Konten materi kosong setelah dibersihkan.");
  return text.substring(0, 8000);
}

async function generateQuizWithGemini(materialText) {
  console.log("[Gemini AI] Generating Quiz...");
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
            explanation: { type: "STRING" }
          },
          required: ["id", "type", "topic", "question", "options", "answer", "explanation"]
        }
      }
    },
    required: ["questions"]
  };

  const systemInstruction = `
  Anda adalah mesin pembuat kuis. Buat 3 soal berdasarkan materi dan pastikan setiap soal unik tetapi tetap berdasarkan materi.
    
    ATURAN PENTING:
    1. Tentukan 'type' soal: "single" (jika hanya 1 jawaban benar) atau "multiple" (jika >1 jawaban benar).
    2. Jika 'type' adalah "single", pastikan array 'answer' hanya berisi 1 string.
    3. Jika 'type' adalah "multiple", array 'answer' berisi semua jawaban benar.
    4. Buat variasi: Usahakan ada campuran soal single dan multiple jika materi memungkinkan.
  `;

  const generationConfig = {
    responseMimeType: "application/json",
    responseSchema: jsonSchema,
  };

  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: materialText }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: generationConfig,
    });
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Error Gemini:", error);
    throw new Error("Gagal membuat soal dari Gemini.");
  }
}

// --- API ROUTES ---

app.get('/api/preferences', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id diperlukan' });

  try {
    const prefs = await fetchUserPreferences(user_id);
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ error: 'Gagal ambil preferensi' });
  }
});

app.get('/api/quiz', async (req, res) => {
  const { tutorial_id } = req.query;
  if (!tutorial_id) return res.status(400).json({ error: 'tutorial_id diperlukan' });

  try {
    const htmlContent = await fetchMaterialFromDicoding(tutorial_id);
    const materialText = cleanHtmlContent(htmlContent);
    const quizData = await generateQuizWithGemini(materialText);

    const finalResponse = {
      materialTitle: `Kuis Materi ${tutorial_id}`,
      ...quizData
    };

    res.status(200).json(finalResponse);
  } catch (error) {
    console.error(`Error Handler:`, error.message);
    res.status(500).json({ error: 'Gagal memproses permintaan.', details: error.message });
  }
});

app.get('/', (req, res) => res.send('Server Backend Ready!'));

app.listen(PORT, () => {
  console.log(`Backend server berjalan di http://localhost:${PORT}`);
});