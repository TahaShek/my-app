"use client";

import { addBookHistory } from "@/app/actions/addBookHistory";

export default function AddHistoryForm({ bookId }: { bookId: string }) {
  async function handleSubmit(formData: FormData) {
    await addBookHistory(
      bookId,
      formData.get("city") as string,
      formData.get("notes") as string
    );
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-3">
      <input
        name="city"
        placeholder="City"
        required
        className="border p-2 w-full"
      />
      <textarea
        name="notes"
        placeholder="Your notes for next reader"
        className="border p-2 w-full"
      />
      <button className="bg-black text-white px-4 py-2">
        Add to History
      </button>
    </form>
  );
}