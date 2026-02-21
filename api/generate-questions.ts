export default async function handler(req, res) {
  try {
    // تنظيف أي أحرف غير ASCII (مثل RTL mark) من المفاتيح
    const clean = (v) => (v || "").replace(/[^\x00-\x7F]/g, "").trim();

    const OPENAI_KEY = clean(process.env.OPENAI_API_KEY);
    const SUPABASE_URL = (process.env.SUPABASE_URL || "").trim();
    const SUPABASE_KEY = clean(process.env.SUPABASE_KEY);

    if (!OPENAI_KEY) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    if (!SUPABASE_URL) return res.status(500).json({ error: "Missing SUPABASE_URL" });
    if (!SUPABASE_KEY) return res.status(500).json({ error: "Missing SUPABASE_KEY" });

    const prompt = `
Generate 20 general knowledge quiz questions.
Return ONLY valid JSON array.
Format:
[
  { "question": "text", "answer": "text", "category": "text" }
]
Do not add explanations or extra text.
`;

    const ai = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const aiData = await ai.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";

    let questions = [];
    try {
      const cleanJson = content.replace(/```json|```/g, "").trim();
      questions = JSON.parse(cleanJson);
      if (!Array.isArray(questions)) questions = [];
    } catch {
      return res.status(500).json({ error: "AI returned invalid JSON", raw: content });
    }

    const payload = questions.map((q) => ({
      question: String(q.question || "").trim(),
      answer: String(q.answer || "").trim(),
      category: String(q.category || "").trim(),
      letter: (String(q.answer || "").trim()[0] || "").toUpperCase(),
    }));

    const sb = await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    // لو Supabase رجع خطأ نعرضه لك بوضوح
    if (!sb.ok) {
      const errText = await sb.text();
      return res.status(500).json({ error: "Supabase insert failed", details: errText });
    }

    return res.status(200).json({ generated: payload.length, stored: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
}
