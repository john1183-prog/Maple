import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

interface FileAIResponseProps {
  files?: File[];
  prompt: string;
  model?: string;
}

const FileAIResponse: React.FC<FileAIResponseProps> = ({
  files,
  prompt,
  // 🟢 CHANGED: Default to a valid Gemini model
  model = "gemini-2.5-flash",
}) => {
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log("My Key is:", apiKey);
  useEffect(() => {
    if (!files?.length || !prompt.trim()) return;

    const processFiles = async () => {
      setLoading(true);
      setError(null);
      setAIResponse(null);

      try {
        // 1️⃣ Extract all text (Same as before)
        let combinedText = "";
        for (const file of files) {
          const type = file.type.toLowerCase();
          if (type.includes("pdf")) {
            combinedText += await extractPDF(file);
          } else if (type.includes("image")) {
            combinedText += await extractImage(file);
          }
        }

        // 2️⃣ Generate AI response (Direct Call)
        const fullPrompt = `${prompt}\n\n${combinedText.trim()}`;
        const aiText = await generateGemini(fullPrompt, model, apiKey);
        setAIResponse(aiText);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    processFiles();
  }, [files, prompt, model, apiKey]);

  // --- PDF Extraction (Unchanged) ---
  const extractPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((i: any) => i.str).join(" ") + "\n";
          }
          resolve(text);
        } catch (e) {
          reject(e);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // --- Image Extraction (Unchanged) ---
  const extractImage = async (file: File): Promise<string> => {
    const url = URL.createObjectURL(file);
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(url, "eng");
      return text + "\n";
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  // --- 🟢 NEW: Direct Gemini API Call ---
  const generateGemini = async (
    fullPrompt: string,
    model: string,
    key: string
  ) => {
    // 1. Construct the URL for the specific model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    // 2. Prepare the Request Body
    const requestBody = {
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
    };

    // 3. Make the Fetch Call
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Gemini API Error: ${errorData.error?.message || res.statusText}`
      );
    }

    const data = await res.json();

    // 4. Parse the confusing Gemini response structure
    // Structure: data.candidates[0].content.parts[0].text
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response text found."
    );
  };

  // --- Render ---
  if (loading)
    return <p className="text-gray-400 animate-pulse">Processing...</p>;
  if (error) return <p className="text-red-500 text-sm">⚠️ {error}</p>;
  if (!aiResponse) return null;

  return <p className="whitespace-pre-wrap text-sm">{aiResponse}</p>;
};

export default FileAIResponse;
