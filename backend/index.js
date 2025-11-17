import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const DICODING_API_BASE_URL = "https://learncheck-dicoding-mock-666748076441.europe-west1.run.app/api";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-09-2025",
});

app.use(cors());
app.use(express.json());

async function fetchMaterialFromDicoding(tutorialId) {
  const apiUrl = `${DICODING_API_BASE_URL}/tutorials/${tutorialId}`;
  console.log(`Memanggil API Dicoding ASLI di: ${apiUrl}`);
  
  try {
    const response = await axios.get(apiUrl);
    return response.data.data.content;
  } catch (error) {
    console.error(`Error saat fetch materi dari Dicoding: ${error.message}`);
    if (error.response && error.response.status === 404) {
      throw new Error(`Materi dengan tutorial_id ${tutorialId} tidak ditemukan di API Dicoding.`);
    }
    throw new Error("Gagal mengambil materi dari API Dicoding.");
  }
}

function cleanHtmlContent(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  console.log("Konten HTML sudah dibersihkan.");
  if (!text) {
    throw new Error("Konten materi kosong setelah dibersihkan.");
  }
  return text;
}

async function generateQuizWithGemini(materialText) {
  console.log("Memanggil Gemini API untuk membuat soal...");

  const jsonSchema = {
    type: "OBJECT",
    properties: {
      questions: {
        type: "ARRAY",
        minItems: 3, 
        maxItems: 3, 
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "NUMBER" },
            topic: { 
              type: "STRING", 
              description: "Kategori/sub-topik dari soal ini, 1-3 kata. Cth: 'React Hooks'" 
            },
            question: { type: "STRING" },
            options: { type: "ARRAY", minItems: 4, maxItems: 4, items: { type: "STRING" } },
            answer: { type: "STRING" },
            explanation: { type: "STRING" }
          },
          required: ["id", "topic", "question", "options", "answer", "explanation"]
        }
      }
    },
    required: ["questions"]
  };

  const systemInstruction = `
    Anda adalah mesin pembuat kuis yang ahli untuk platform edukasi teknologi.
    Tugas Anda adalah membuat TEPAT 3 pertanyaan pilihan ganda (multiple choice) yang relevan dan mendalam berdasarkan teks materi yang diberikan.

    ATURAN KETAT:
    1.  Harus ada TEPAT 3 pertanyaan.
    2.  Setiap pertanyaan harus memiliki TEPAT 4 opsi jawaban.
    3.  Setiap pertanyaan HARUS memiliki 'topic' yang mengkategorikan soal (1-3 kata).
    4.  'answer' HARUS sama persis dengan salah satu teks di 'options'.
    5.  'explanation' harus menjelaskan mengapa jawaban itu benar, berdasarkan materi.
    6.  Respons HARUS dalam format JSON yang valid sesuai skema.
    7.  Gaya soal harus berbeda dari yang sebelumnya tetapi materi tetap sama
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

    const responseText = result.response.text();
    console.log("Soal (dengan topic) berhasil dibuat oleh Gemini.");
    return JSON.parse(responseText);

  } catch (error) {
    console.error("Error saat memanggil Gemini:", error);
    throw new Error("Gagal membuat soal dari Gemini. Cek API Key atau status model.");
  }
}

app.get('/api/quiz', async (req, res) => {
  const { tutorial_id } = req.query;

  if (!tutorial_id) {
    return res.status(400).json({ error: 'tutorial_id diperlukan' });
  }

  try {
    const htmlContent = await fetchMaterialFromDicoding(tutorial_id);
    const materialText = cleanHtmlContent(htmlContent);
    const quizData = await generateQuizWithGemini(materialText);

    const finalQuizObject = {
      materialTitle: `Kuis untuk Materi ${tutorial_id}`,
      ...quizData
    };

    res.status(200).json(finalQuizObject);

  } catch (error) {
    console.error(`Error di rute /api/quiz untuk tutorial ${tutorial_id}:`, error.message);
    res.status(500).json({ error: 'Gagal memproses permintaan kuis.', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Server Backend LearnCheck Aktif!');
});

app.listen(PORT, () => {
  console.log(`Backend server berjalan di http://localhost:${PORT}`);
});