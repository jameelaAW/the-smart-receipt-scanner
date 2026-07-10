"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { resizeImageToDataUrl } from "@/lib/resizeImage";
import type { Receipt } from "@/lib/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export function UploadWidget({
  onScanned,
  disabled,
  disabledReason,
  signInRequired,
}: {
  onScanned: (receipt: Receipt, warning?: string) => void;
  disabled?: boolean;
  disabledReason?: string;
  /** TASKS.md Sprint 4: unauthenticated visitors see demo only; prompt to sign up. */
  signInRequired?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setStatus("error");
      setError("Please upload a JPG or PNG");
      return;
    }

    setStatus("uploading");
    try {
      const imageDataUrl = await resizeImageToDataUrl(file);
      const res = await fetch("/api/receipts/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl }),
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(json.error ?? "Upload failed");
        return;
      }

      setStatus("idle");
      onScanned(json.receipt, json.warning);
    } catch {
      setStatus("error");
      setError("Upload failed — check your connection and try again");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (signInRequired) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
        <p>Sign up to scan and save your own receipts.</p>
        <Link
          href="/login"
          className="mt-3 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Sign up / sign in
        </Link>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
        {disabledReason ?? "Uploads are disabled right now."}
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? "border-neutral-900 bg-neutral-50" : "border-neutral-300 hover:bg-neutral-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {status === "uploading" ? (
          <>
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
            <p className="text-sm text-neutral-500">
              Scanning receipt&hellip; extracting vendor, date &amp; amount
            </p>
          </>
        ) : (
          <>
            <span className="text-2xl">📤</span>
            <p className="text-sm font-medium text-neutral-700">
              Drop a receipt image, or click to upload
            </p>
            <p className="text-xs text-neutral-400">JPG or PNG</p>
          </>
        )}
      </label>
      {status === "error" && error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
