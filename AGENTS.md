## Project Rules (Appointment System)
- This is an EXISTING production website (Next.js + Supabase). Never modify, refactor, or restyle unrelated code.
- This project uses a recent Next.js version that may differ from your training data. Before writing Next.js code, check the installed version in package.json and read the official docs for that version.
- Before any change: scan the project, state the detected stack, propose a file plan, and WAIT for my approval.
- Work in phases. Stop after each phase and tell me how to test it.
- Use the existing Supabase setup for the database. Do not introduce another database.
- Use the Gemini API with model "gemini-3.8-flash" and the Interactions API (the current default). Do NOT use the legacy generateContent API. If unsure about syntax, read the official docs at ai.google.dev/gemini-api/docs first.
- The Gemini API key must live only on the backend in .env. Never expose it to frontend code. Update .env.example.
- Timezone is Asia/Karachi everywhere.
- Show a summary of every file changed.
