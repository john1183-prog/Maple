import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import mammoth from "mammoth"; // Import mammoth for .docx

// PDF.js worker setup (Keep your existing path)
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

interface FileAIResponseProps {
  files?: File[];
  prompt: string;
  model?: string;
}

const FileAIResponse: React.FC<FileAIResponseProps> = ({
  files,
  prompt,
  model = "tinyllama",
}) => {
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>(""); // Granular status updates
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!files?.length || !prompt.trim()) return;

    const processFiles = async () => {
      setLoading(true);
      setError(null);
      setAIResponse(null);
      setStatusMessage("Reading files...");

      try {
        // 1️⃣ Extract all text based on file type
        let combinedText = "";

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
              name.endsWith(".csv") ||
              name.endsWith(".json")
            ) {
              combinedText += await extractPlainText(file);
            } else {
              console.warn(`Unsupported file type: ${type}`);
            }

            // Add a separator between files for the AI
            combinedText += "\n\n--- FILE SEPARATOR ---\n\n";
          } catch (extractError) {
            console.error(`Failed to read ${file.name}`, extractError);
            // We continue loop even if one file fails
          }
        }

        if (!combinedText.trim()) {
          throw new Error("No readable text found in the uploaded files.");
        }

        // 2️⃣ Truncate text to fit Context Window
        const MAX_TEXT_LENGTH = 6000; // Increased slightly for safety
        if (combinedText.length > MAX_TEXT_LENGTH) {
          setStatusMessage("Text too long. Truncating...");
          combinedText = combinedText.substring(0, MAX_TEXT_LENGTH);
          combinedText += "\n\n[Note: Input was truncated to fit API limits]";
        }

        // 3️⃣ Generate AI response
        setStatusMessage("Waiting for AI...");
        const fullPrompt = `${prompt}\n\nContext:\n${combinedText.trim()}`;
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

  // --- 1. PDF Extraction ---
  const extractPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = `--- START PDF: ${file.name} ---\n`;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Adding \n preserves paragraph structure better than space
      const pageText = content.items.map((item: any) => item.str).join(" ");
      text += pageText + "\n";
    }
    return text;
  };

  // --- 2. DOCX Extraction (New) ---
  const extractDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    // extractRawText ignores formatting/images, perfect for LLMs
    const result = await mammoth.extractRawText({ arrayBuffer });
    return `--- START DOCX: ${file.name} ---\n${result.value}`;
  };

  // --- 3. Plain Text Extraction (New) ---
  const extractPlainText = async (file: File): Promise<string> => {
    const text = await file.text();
    return `--- START TEXT: ${file.name} ---\n${text}`;
  };

  // --- 4. Image Extraction (OCR) ---
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

  // --- AI Call ---
  const generateAI = async (fullPrompt: string, model: string) => {
    const res = await fetch("/api/proxy", {
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
  if (loading) {
    return (
      <div className="space-y-2">
        <p className="text-gray-400 animate-pulse">Processing...</p>
        {statusMessage && (
          <p className="text-xs text-gray-500">{statusMessage}</p>
        )}
      </div>
    );
  }

  if (error) return <p className="text-red-500 text-sm">⚠️ {error}</p>;
  if (!aiResponse) return null;

  return (
    <div className="p-4 bg-gray-50 rounded border border-gray-200 mt-4">
      <h3 className="font-bold mb-2 text-sm text-gray-700">AI Analysis:</h3>
      <p className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
        {aiResponse}
      </p>
    </div>
  );
};

export default FileAIResponse;
