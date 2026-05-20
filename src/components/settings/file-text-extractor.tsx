"use client";

import { useState, useRef } from "react";
import { FileUp, Loader2, FileText, X, AlertTriangle } from "lucide-react";

interface Props {
  onExtracted: (text: string, filename: string) => void;
  maxChars?: number;
}

const MAX_BYTES = 25 * 1024 * 1024;

export function FileTextExtractor({ onExtracted, maxChars = 30000 }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setTruncated(false);
    setFileName(file.name);

    if (file.size > MAX_BYTES) {
      setError("File too large (max 25 MB).");
      setFileName(null);
      return;
    }

    setBusy(true);
    try {
      let text = "";
      const lower = file.name.toLowerCase();

      if (lower.endsWith(".pdf") || file.type === "application/pdf") {
        text = await extractPdf(file);
      } else if (lower.endsWith(".docx")) {
        text = await extractDocx(file);
      } else if (lower.endsWith(".txt") || lower.endsWith(".md") || file.type.startsWith("text/")) {
        text = await file.text();
      } else {
        throw new Error("Unsupported format. Use PDF, DOCX, TXT or MD.");
      }

      text = text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

      if (text.length < 50) {
        throw new Error("Could not extract readable text (scanned/image PDF?).");
      }
      if (text.length > maxChars) {
        text = text.slice(0, maxChars);
        setTruncated(true);
      }

      onExtracted(text, file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed");
      setFileName(null);
    } finally {
      setBusy(false);
    }
  }

  async function extractPdf(file: File): Promise<string> {
    const pdfjs = await import("pdfjs-dist");
    // @ts-expect-error worker entry has no types
    const worker = await import("pdfjs-dist/build/pdf.worker.mjs");
    pdfjs.GlobalWorkerOptions.workerPort = new worker.default();

    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    const parts: string[] = [];
    const maxPages = Math.min(doc.numPages, 120);
    for (let i = 1; i <= maxPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((it) => ("str" in it ? it.str : "")).join(" ");
      parts.push(strings);
      if (parts.join(" ").length > maxChars * 1.2) break;
    }
    return parts.join("\n\n");
  }

  async function extractDocx(file: File): Promise<string> {
    const mammoth = await import("mammoth");
    const buf = await file.arrayBuffer();
    const res = await mammoth.extractRawText({ arrayBuffer: buf });
    return res.value;
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md,application/pdf,text/plain"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 px-4 py-6 border border-dashed border-border rounded-lg text-sm text-text-muted hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
      >
        {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting text…</>
              : <><FileUp className="w-4 h-4" /> Upload a file (PDF, DOCX, TXT)</>}
      </button>

      {fileName && !error && (
        <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
          <FileText className="w-3.5 h-3.5 text-accent" />
          <span className="truncate">{fileName}</span>
          {truncated && <span className="text-gold">· truncated to {maxChars.toLocaleString()} chars</span>}
          <button onClick={() => { setFileName(null); onExtracted("", ""); }} className="ml-auto text-text-dim hover:text-danger"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-danger-soft border border-danger/30 rounded text-xs text-danger">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
