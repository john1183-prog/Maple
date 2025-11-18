import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore (Tesseract types can be tricky, ignore strict check)
import Tesseract from "tesseract.js";
import mammoth from "mammoth";

// FIX: Import worker as a URL for Vite
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface FileAIResponseProps {
  files?: File[];
  prompt: string;
  model?: string;
}

const FileAIResponse: React.FC<FileAIResponseProps> = ({
  files,
  prompt,
  model = "gemini-1.5-flash",
}) => {
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ((!files || files.length === 0) && !prompt.trim()) return;

    const processFiles = async () => {
      setLoading(true);
      setError(null);
      setAIResponse(null);

      if (files && files.length > 0) {
        setStatusMessage("Reading documents...");
      } else {
        setStatusMessage("Thinking...");
      }

      try {
        let combinedText = "";

        if (files && files.length > 0) {
          for (const file of files) {
            const type = file.type.toLowerCase();
            const name = file.name.toLowerCase();
            setStatusMessage(`Processing ${file.name}...`);

            try {
              if (type.includes("pdf")) {
                combinedText += await extractPDF(file);
              } else if (type.includes("image")) {
                combinedText += await extractImage(file);
              } else if (
                type.includes("wordprocessingml") ||
                name.endsWith(".docx")
              ) {
                combinedText += await extractDocx(file);
              } else if (
                type.includes("text") ||
                name.endsWith(".txt") ||
                name.endsWith(".md") ||
                name.endsWith(".ts") ||
                name.endsWith(".tsx") ||
                name.endsWith(".json")
              ) {
                combinedText += await extractPlainText(file);
              }
              combinedText += "\n\n--- FILE SEPARATOR ---\n\n";
            } catch (extractError) {
              console.error(`Failed to read ${file.name}`, extractError);
            }
          }
        }

        const MAX_TEXT_LENGTH = 50000;
        if (combinedText.length > MAX_TEXT_LENGTH) {
          setStatusMessage("Document huge. Truncating...");
          combinedText = combinedText.substring(0, MAX_TEXT_LENGTH);
          combinedText += "\n\n[Truncated]";
        }

        setStatusMessage("Waiting for AI...");
        const fullPrompt = combinedText
          ? `${prompt}\n\nContext from files:\n${combinedText.trim()}`
          : prompt;

        const aiText = await generateAI(fullPrompt, model);
        setAIResponse(aiText);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
        setStatusMessage("");
      }
    };

    processFiles();
  }, [files, prompt, model]);

  // --- Helpers ---
  const extractPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = `--- START PDF: ${file.name} ---\n`;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  };

  const extractDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return `--- START DOCX: ${file.name} ---\n${result.value}`;
  };

  const extractPlainText = async (file: File): Promise<string> => {
    const text = await file.text();
    return `--- START TEXT: ${file.name} ---\n${text}`;
  };

  const extractImage = async (file: File): Promise<string> => {
    const url = URL.createObjectURL(file);
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(url, "eng");
      return `--- START IMAGE: ${file.name} ---\n${text}`;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const generateAI = async (fullPrompt: string, model: string) => {
    // Detect if we are on localhost (Vite) vs Vercel
    const isLocal = window.location.hostname === "localhost";

    // If using 'npm run dev', the API isn't running. Warn the user.
    // You MUST use 'vercel dev' to test locally.

    const res = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: fullPrompt }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AI API error (${res.status}): ${body}`);
    }

    const data = await res.json();
    return data.response || "No response";
  };

  if (loading) {
    return (
      <div className="space-y-2 mt-4 p-4 bg-blue-50 rounded text-blue-700">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm animate-pulse">{statusMessage}</p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="p-4 mt-4 bg-red-50 text-red-600 rounded text-sm">
        ⚠️ {error}
      </div>
    );
  if (!aiResponse) return null;

  return (
    <div className="p-6 bg-white rounded-lg shadow border border-gray-200 mt-4">
      <h3 className="font-bold mb-4 text-gray-900 border-b pb-2">
        AI Analysis
      </h3>
      <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
        {aiResponse}
      </div>
    </div>
  );
};

export default FileAIResponse;
