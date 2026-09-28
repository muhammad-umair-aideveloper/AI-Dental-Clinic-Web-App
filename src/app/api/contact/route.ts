import { insertInquiry } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { name, phone, message } = await req.json();

    if (!name || !phone) {
      return new Response(
        JSON.stringify({ error: "Name and phone number are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Persist to inquiry store
    await insertInquiry({ name, phone, message: message || "" });

    const adminEmail = process.env.CLINIC_ADMIN_EMAIL || "info@lahoredental.pk";
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Lahore Dental Web <contact@lahoredental.pk>",
            to: [adminEmail],
            subject: `New Patient Inquiry: ${name} (${phone})`,
            html: `
              <h3>New Website Inquiry</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Message:</strong></p>
              <p>${message || "No message provided"}</p>
              <hr/>
              <p><em>Received via Lahore Dental Web Portal</em></p>
            `,
          }),
        });
      } catch (e) {
        console.error("Failed to send contact inquiry via Resend:", e);
      }
    }

    console.log(`[Contact Form Received] From: ${name}, Phone: ${phone}, Message: ${message}`);

    return new Response(
      JSON.stringify({ success: true, message: "Inquiry received successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Contact API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to submit inquiry. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
