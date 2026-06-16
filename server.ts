import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { PDFParse } from "pdf-parse";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.post("/api/resume/parse", async (req, res) => {
    console.log("POST /api/resume/parse - Start");
    try {
      const { base64Pdf } = req.body;
      if (!base64Pdf) {
        console.error("Missing base64Pdf in request body");
        return res.status(400).json({ error: "Missing PDF data" });
      }

      console.log("Converting base64 to buffer...");
      const buffer = Buffer.from(base64Pdf, 'base64');
      
      console.log("Calling PDFParse...");
      // Convert Buffer to Uint8Array for better performance/compatibility with the new API
      const uint8Array = new Uint8Array(buffer);
      const parser = new PDFParse({ data: uint8Array });
      
      const result = await parser.getText();
      let text = result.text?.trim() || "";
      
      // Cleanup to prevent memory leaks, especially for large files
      await parser.destroy();
      
      console.log("PDF parsed successfully. Text length:", text.length);
      
      // Heuristic: If text length is very low, it might be a scanned PDF or image-based.
      // Resumes usually have at least 500+ characters. 150 is a safe threshold for "very sparse".
      if (text.length < 150) {
        console.log(`Sparse text detected (${text.length} chars). Attempting AI-driven OCR with Gemini...`);
        try {
          const ocrResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: base64Pdf
                  }
                },
                {
                  text: "You are an expert OCR service. This PDF is a resume that appears to be a scanned image. Please extract all visible text from it exactly as it appears. Maintain the structure and information. Provide ONLY the extracted text."
                }
              ]
            }
          });

          const ocrText = ocrResponse.text?.trim() || "";
          if (ocrText.length > text.length) {
            console.log(`AI OCR successful. Extracted text length: ${ocrText.length}`);
            text = ocrText;
          } else {
            console.log("AI OCR did not provide more text than standard parsing. Keeping original.");
          }
        } catch (ocrError) {
          console.error("AI OCR Error:", ocrError);
          // If OCR fails, we still have the original (possibly empty) text
        }
      }
      
      if (text.length === 0) {
        console.warn("Parsed PDF resulted in empty text even after OCR attempt");
      }

      res.json({ text });
    } catch (error) {
      console.error("PDF Parse Error:", error);
      res.status(500).json({ error: "Failed to parse PDF document. Ensure it's a valid PDF." });
    }
  });

  app.post("/api/analyze", async (req, res) => {
    console.log("POST /api/analyze - Start");
    try {
      const { resumeText, jobDescription } = req.body;
      
      if (!resumeText || !jobDescription) {
        console.error("Missing input data for analysis");
        return res.status(400).json({ error: "Resume text and job description are required" });
      }

      console.log("Calling Gemini API for analysis...");
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following resume against the job description. 
        Extract key skills, identify missing keywords, and calculate an ATS score (0-100).
        
        Resume Text:
        ${resumeText}
        
        Job Description:
        ${jobDescription}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["score", "missingKeywords", "matchedKeywords", "improvementTips"]
          }
        }
      });

      console.log("Gemini API call successful");
      const resultText = response.text || "{}";
      
      try {
        const result = JSON.parse(resultText);
        res.json(result);
      } catch (parseError) {
        console.error("JSON Parse Error from AI response:", parseError, "Raw output:", resultText);
        // Fallback or retry logic could go here, but for now return error
        res.status(500).json({ error: "Invalid response format from AI" });
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: "AI analysis failed. Please try again." });
    }
  });

  app.post("/api/optimize", async (req, res) => {
    console.log("POST /api/optimize - Start");
    try {
      const { resumeText, jobDescription, missingKeywords } = req.body;
      
      console.log("Calling Gemini API for optimization...");
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Optimize the following resume for the job description.
        Incorporate the missing keywords naturally without creating fake experience.
        Improve readability and impact of bullet points by using strong action verbs and quantifying results where possible.
        Maintain professional formatting structure.
        
        Resume:
        ${resumeText}
        
        Job Description:
        ${jobDescription}
        
        Missing Keywords to include: ${missingKeywords?.join(", ") || ""}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedResumeText: { type: Type.STRING },
              summary: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              experience: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    company: { type: Type.STRING },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              },
              newScore: { type: Type.NUMBER }
            },
            required: ["optimizedResumeText", "summary", "skills", "experience", "newScore"]
          }
        }
      });

      console.log("Gemini Optimization API call successful");
      const resultText = response.text || "{}";
      
      try {
        const result = JSON.parse(resultText);
        res.json(result);
      } catch (parseError) {
        console.error("JSON Parse Error from AI optimization response:", parseError, "Raw output:", resultText);
        res.status(500).json({ error: "Invalid optimization format from AI" });
      }
    } catch (error) {
      console.error("Optimization Error:", error);
      res.status(500).json({ error: "AI optimization failed. Please try again." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
