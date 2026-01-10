"use server";

import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";

export async function createBook(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // 1️⃣ Insert book
  const { data: book, error } = await supabase
    .from("books")
    .insert({
      title: formData.get("title"),
      author: formData.get("author"),
      condition: formData.get("condition"),
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // 2️⃣ Generate QR
  const qrValue = `BOOK-${book.id}`;
  const qrImage = await QRCode.toDataURL(qrValue);

  // 3️⃣ Save QR reference
  await supabase
    .from("books")
    .update({ qr_code: qrValue })
    .eq("id", book.id);

  return {
    bookId: book.id,
    qrImage,
  };
}