"use server";

import { createClient } from "@/lib/supabase/server";

export async function addBookHistory(
  bookId: string,
  city: string,
  notes: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Ensure user owns the book
  const { data: book } = await supabase
    .from("books")
    .select("owner_id")
    .eq("id", bookId)
    .single();

  if (book?.owner_id !== user.id) {
    throw new Error("Not book owner");
  }

  await supabase.from("book_history").insert({
    book_id: bookId,
    user_id: user.id,
    city,
    notes,
  });
}
