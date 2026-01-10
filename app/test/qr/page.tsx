"use client";

import { useState } from "react";
import { createBook } from "@/app/actions/createBook";

export default function TestQRPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [bookId, setBookId] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await createBook(formData);
    setQr(res.qrImage);
    setBookId(res.bookId);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>QR Code Test</h1>

      <form action={handleSubmit}>
        <input
          name="title"
          placeholder="Book Title"
          required
        />
        <br />

        <input
          name="author"
          placeholder="Author"
          required
        />
        <br />

        <select name="condition">
          <option>New</option>
          <option>Good</option>
          <option>Fair</option>
        </select>
        <br /><br />

        <button type="submit">Generate QR</button>
      </form>

      {qr && (
        <div style={{ marginTop: 30 }}>
          <h2>Generated QR</h2>
          <img src={qr} alt="QR Code" />
          <p><strong>Book ID:</strong> {bookId}</p>
        </div>
      )}
    </div>
  );
}