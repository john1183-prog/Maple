import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

interface FileAIResponseProps {
  files?: File[]; // Array of uploaded files (PDFs or images)
  prompt: string; // Custom AI prompt, e.g. "Summarize the following:"
  model?: string; // Optional AI model, defaults to "tinyllama"
}

const FileAIResponse: React.FC<FileAIResponseProps> = ({
  files,
  prompt,
  model = "tinyllama",
}) => {
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!files?.length || !prompt.trim()) return;

    const processFiles = async () => {
      setLoading(true);
      setError(null);
      setAIResponse(null);

      try {
        // 1️⃣ Extract all text
        let combinedText = "";
        for (const file of files) {
          const type = file.type.toLowerCase();
          if (type.includes("pdf")) {
            combinedText += await extractPDF(file);
          } else if (type.includes("image")) {
            combinedText += await extractImage(file);
          }
        }

        // 2️⃣ Generate AI response
        const fullPrompt = `${prompt}\n\n${combinedText.trim()}`;
        const aiText = await generateAI(fullPrompt, model);
        setAIResponse(aiText);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    processFiles();
  }, [files, prompt, model]);

  // --- PDF Extraction ---
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

  // --- Image Extraction ---
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

  // --- AI Call ---
  const generateAI = async (fullPrompt: string, model: string) => {
    const res = await fetch("https://mlvoca.com/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: fullPrompt, stream: false }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AI API error (${res.status}): ${body}`);
    }

    const data = await res.json();
    return typeof data.response === "string" ? data.response : "No response";
  };

  // --- Render ---
  if (loading)
    return <p className="text-gray-400 animate-pulse">Processing...</p>;
  if (error) return <p className="text-red-500 text-sm">⚠️ {error}</p>;
  if (!aiResponse) return null;

  return <p className="whitespace-pre-wrap text-sm">{aiResponse}</p>;
};

export default FileAIResponse;
