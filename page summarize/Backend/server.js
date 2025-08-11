import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import sdk from "microsoft-cognitiveservices-speech-sdk";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the Google AI and Text-to-Speech clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ttsClient = new TextToSpeechClient();

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
