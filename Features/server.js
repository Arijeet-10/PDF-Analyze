import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import sdk from "microsoft-cognitiveservices-speech-sdk";
import multer from "multer";
import pdf from "pdf-parse";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the Google AI and Text-to-Speech clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ttsClient = new TextToSpeechClient();

const storage = multer.memoryStorage();
// Accept an array of files under the field name 'files'
const upload = multer({ storage: storage });

app.post("/summarize-text", async (req, res) => {
  const { text } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Summarize this text clearly and concisely:\n\n${text}`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to summarize text" });
  }
});


app.post("/ask-pdf", upload.array('files'), async (req, res) => {
  if (!req.files || req.files.length === 0 || !req.body.question) {
    return res.status(400).json({ error: "At least one file and a question are required." });
  }

  // --- UPDATED: Get language from request body ---
  const { question, language = 'English' } = req.body;
  const pdfFiles = req.files;
  let combinedText = "";

  try {
    for (const file of pdfFiles) {
        const data = await pdf(file.buffer);
        combinedText += `--- START OF DOCUMENT: ${file.originalname} ---\n\n`;
        combinedText += data.text;
        combinedText += `\n\n--- END OF DOCUMENT: ${file.originalname} ---\n\n`;
    }
    
    if (!combinedText) {
        return res.status(500).json({ error: "Could not extract text from the provided PDF(s)." });
    }

    // --- UPDATED: Model name corrected and prompt now includes language instruction ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      You are an intelligent assistant. Please answer the following question in the ${language} language, based *only* on the content of the provided documents.
      If the answer cannot be found within the documents, state that clearly in ${language}. Be concise and helpful.
      When referencing information, mention which document it came from if possible. Only write the answer, do not include any additional text.
      Write in a markdown format with bold sub headings and bullet points if needed.

      DOCUMENTS CONTENT:
      ---
      ${combinedText}
      ---

      QUESTION:
      ${question}
    `;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });

  } catch (err) {
    console.error("Error processing PDFs:", err);
    res.status(500).json({ error: "Failed to process the PDFs and answer the question." });
  }
});




app.post("/ask", async (req, res) => {
  const { text, question } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Corrected model name
    const prompt = `
You are a helpful assistant. Answer the following question using the provided page content breifly.
If the answer is not in the content, say "I couldn't find that in this page."

Page Content:
${text}

Question: ${question}
    `;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to answer question" });
  }
});


const speechKey = process.env.AZURE_SPEECH_KEY;
const speechRegion = process.env.AZURE_SPEECH_REGION;

app.post('/generate-podcast', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }
    
    // --- UPDATED: Get language from request body ---
    const { language = 'English' } = req.body;

    let combinedText = '';
    for (const file of req.files) {
      const data = await pdf(file.buffer);
      combinedText += data.text + '\n\n';
    }

    if (!combinedText.trim()) {
      return res.status(400).json({ error: 'Could not extract text from the provided files.' });
    }

    // --- UPDATED: Prompt now includes language instruction ---
    const summaryPrompt = `
      Summarize the following text into a concise version that can be read as a podcast in the ${language} language, in under 4 minutes.
      Only write the summary; do not include any additional text.
      ${combinedText}
    `;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const geminiResult = await model.generateContent(summaryPrompt);
    const summary = geminiResult.response.text().trim();
    console.log("Generated summary:", summary);

    // --- UPDATED: Selects voice based on language ---
    const voiceMap = {
        'English': 'en-US-AriaNeural',
        'Bengali': 'bn-IN-TanishaaNeural',
        'Hindi': 'hi-IN-SwaraNeural'
    };

    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechSynthesisVoiceName = voiceMap[language] || 'en-US-AriaNeural';
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

    synthesizer.speakTextAsync(
      summary,
      result => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log("✅ Audio generated successfully.");
          const audioBase64 = Buffer.from(result.audioData).toString("base64");
          res.json({
            audioContent: audioBase64,
            format: "mp3"
          });
        } else {
          console.error("❌ Error synthesizing speech:", result.errorDetails);
          res.status(500).json({ error: `Azure Speech Error: ${result.errorDetails}` });
        }
      },
      err => {
        synthesizer.close();
        console.error("❌ Speech SDK Error:", err);
        res.status(500).json({ error: `Speech SDK Error: ${err.message}` });
      }
    );

  } catch (error) {
    console.error("Server error in /generate-podcast:", error);
    res.status(500).json({ error: error.message });
  }
});


app.post("/facts", upload.array('files'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "At least one file is required." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Corrected model name
    const allFacts = [];

    for (const file of req.files) {
      try {
        const data = await pdf(file.buffer);
        const text = data.text;

        if (!text || text.trim().length < 100) {
          allFacts.push({
            filename: file.originalname,
            facts: ["This document does not contain enough text to extract facts."],
          });
          continue; 
        }

        const textSample = text.substring(0, 8000);
        const prompt = `
          Based on the following document text, extract 2-3 interesting, specific, and surprising facts or key insights.
          Present them as a short, easy-to-read bulleted list. Each fact should be a complete sentence.
          If no specific facts can be found, state that clearly. Only return the bullet points.

          DOCUMENT TEXT SAMPLE:
          ---
          ${textSample}
          ---
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const factsArray = responseText
          .split('\n')
          .map(line => line.replace(/[-\*]\s*/, '').trim())
          .filter(line => line.length > 0);

        allFacts.push({
          filename: file.originalname,
          facts: factsArray.length > 0 ? factsArray : ["No specific facts could be extracted."],
        });

      } catch (pdfError) {
        console.error(`Error processing file ${file.originalname}:`, pdfError);
        allFacts.push({
          filename: file.originalname,
          facts: ["Could not process this PDF file to extract facts."],
        });
      }
    }

    res.json({ facts: allFacts });

  } catch (err) {
    console.error("Error in /facts endpoint:", err);
    res.status(500).json({ error: "Failed to process files and extract facts." });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

