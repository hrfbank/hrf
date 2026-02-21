export default async function handler(req, res) {
  try {

    const prompt = `
    قم بتوليد 20 سؤال معلومات عامة للعبة حروف.
    أعدها JSON بهذا الشكل فقط:
    [
      { "question": "", "answer": "", "category": "" }
    ]
    `;

    const ai = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const aiData = await ai.json();
    const text = aiData.choices?.[0]?.message?.content || "[]";

    let questions = [];
    try {
      questions = JSON.parse(text);
    } catch {
      questions = [];
    }

    await fetch(`${process.env.SUPABASE_URL}/rest/v1/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.SUPABASE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(
        questions.map(q => ({
          question: q.question,
          answer: q.answer,
          category: q.category,
          letter: q.answer?.[0] || ""
        }))
      )
    });

    res.status(200).json({
      generated: questions.length,
      stored: true
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
