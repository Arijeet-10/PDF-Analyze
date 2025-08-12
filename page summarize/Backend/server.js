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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
  // Check if files and question are provided
  if (!req.files || req.files.length === 0 || !req.body.question) {
    return res.status(400).json({ error: "At least one file and a question are required." });
  }

  const { question } = req.body;
  const pdfFiles = req.files;
  let combinedText = "";

  try {
    // 1. Extract text from all PDF buffers and combine them
    for (const file of pdfFiles) {
        const data = await pdf(file.buffer);
        combinedText += `--- START OF DOCUMENT: ${file.originalname} ---\n\n`;
        combinedText += data.text;
        combinedText += `\n\n--- END OF DOCUMENT: ${file.originalname} ---\n\n`;
    }
    
    if (!combinedText) {
        return res.status(500).json({ error: "Could not extract text from the provided PDF(s)." });
    }

    // 2. Use Gemini to answer the question based on the combined PDF text
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are an intelligent assistant. Please answer the following question based *only* on the content of the provided documents.
      If the answer cannot be found within the documents, state that clearly. Be concise and helpful.
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

    // 3. Send the answer back to the client
    res.json({ answer });

  } catch (err) {
    console.error("Error processing PDFs:", err);
    res.status(500).json({ error: "Failed to process the PDFs and answer the question." });
  }
});




app.post("/ask", async (req, res) => {
  const { text, question } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

// New route to handle podcast generation


const speechKey = process.env.AZURE_SPEECH_KEY;
const speechRegion = process.env.AZURE_SPEECH_REGION;

app.post("/generate-podcast", async (req, res) => {
  try {
    const originalText = req.body.text || "Hello, this is a test podcast.";

    // 1. Summarize using Google Gemini instead of Azure OpenAI
    const summaryPrompt = `
    Summarize the following text into a concise version that can be read as podcast in under 4 minutes:
    Only write the summary, do not include any additional text.
    ${originalText}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const geminiResult = await model.generateContent(summaryPrompt);
    const summary = geminiResult.response.text().trim();

    console.log("Generated summary:", summary);

    // 2. Use Azure Speech to convert summary to audio
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechSynthesisVoiceName = "en-US-AriaNeural";
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const audioConfig = null; // Output directly to buffer
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

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
          res.status(500).json({ error: result.errorDetails });
        }
      },
      err => {
        synthesizer.close();
        console.error("❌ Error:", err);
        res.status(500).json({ error: err.message });
      }
    );

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.message });
  }
});





app.listen(5000, () => {
  console.log("Server running on port 5000");
});
