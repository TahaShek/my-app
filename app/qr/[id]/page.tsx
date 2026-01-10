import { createClient } from "@/lib/supabase/server";

export default async function QRPage({
  params,
}: {
  params: { code: string };
}) {
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("qr_code", params.code)
    .single();

  console.log(book);
  if (!book) {
    return <div>Invalid QR Code</div>;
  }

  const { data: history } = await supabase
    .from("book_history")
    .select("*, profiles(username)")
    .eq("book_id", book.id)
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{book.title}</h1>
      <p className="text-gray-500">{book.author}</p>

      <h2 className="mt-6 text-xl font-semibold">📜 Book Journey</h2>

      <div className="mt-4 space-y-4">
        {history?.map((h, i) => (
          <div key={h.id} className="border-l-2 pl-4">
            <p className="font-medium">
              {h.city}
            </p>
            <p className="text-sm text-gray-600">
              {new Date(h.created_at).toDateString()}
            </p>
            <p className="mt-1">{h.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}