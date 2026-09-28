export interface NotificationPayload {
  name: string;
  phone: string;
  date: string;
  time: string;
  reason?: string;
  language?: string;
  recipientEmail?: string;
}

/**
 * Send WhatsApp booking confirmation via Twilio HTTP API
 */
export async function sendWhatsAppConfirmation(
  payload: NotificationPayload
): Promise<boolean> {
  const isUrdu = payload.language === "ur";
  const messageBody = isUrdu
    ? `🦷 *لاہور ڈینٹل — وقت کی تصدیق*\n\nمحترم/محترمہ ${payload.name}،\nآپ کا ڈینٹل معائنہ کامیابی سے طے پا گیا ہے۔\n\n📅 تاریخ: ${payload.date}\n⏰ وقت: ${payload.time}\n🩺 مقصد: ${payload.reason || "عمومی معائنہ"}\n📍 پتہ: پلازہ 42-B، مین بلیوارڈ، گلبرگ III، لاہور\n📞 رابطہ: +92 300 1234567\n\nبرائے مہربانی مقررہ وقت سے 10 منٹ پہلے تشریف لائیں۔ شکریہ!`
    : `🦷 *Lahore Dental — Appointment Confirmed*\n\nDear ${payload.name},\nYour dental appointment has been successfully scheduled.\n\n📅 Date: ${payload.date}\n⏰ Time: ${payload.time}\n🩺 Reason: ${payload.reason || "General Consultation"}\n📍 Address: Plaza 42-B, Main Boulevard, Gulberg III, Lahore\n📞 Hotline: +92 300 1234567\n\nPlease arrive 10 minutes prior to your scheduled time. Thank you!`;

  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

  if (twilioAccountSid && twilioAuthToken) {
    try {
      let formattedPhone = payload.phone.replace(/[^0-9+]/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+92" + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+" + formattedPhone;
      }

      const params = new URLSearchParams();
      params.append("To", `whatsapp:${formattedPhone}`);
      params.append("From", twilioFromNumber);
      params.append("Body", messageBody);

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      if (!res.ok) {
        const errData = await res.text();
        console.error("[Twilio WhatsApp API Error]:", errData);
        return false;
      }

      console.log(`[Twilio WhatsApp] Sent confirmation to ${formattedPhone}`);
      return true;
    } catch (error) {
      console.error("[Twilio WhatsApp] Exception:", error);
      return false;
    }
  }

  // Graceful simulated delivery when Twilio credentials are not set
  console.log(`[Simulated WhatsApp Confirmation]\nRecipient: ${payload.phone}\nBody:\n${messageBody}`);
  return true;
}

/**
 * Send Email booking confirmation via Resend HTTP API
 */
export async function sendEmailConfirmation(
  payload: NotificationPayload
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const clinicEmail = process.env.CLINIC_ADMIN_EMAIL || "appointments@lahoredental.pk";
  const toEmail = payload.recipientEmail || clinicEmail;

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Lahore Dental <appointments@lahoredental.pk>",
          to: [toEmail],
          subject: `Appointment Confirmed: ${payload.name} - ${payload.date} at ${payload.time}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0f2fe; border-radius: 12px;">
              <div style="background-color: #0284c7; color: white; padding: 16px; border-radius: 8px; text-align: center;">
                <h2 style="margin: 0;">Lahore Dental Clinic</h2>
                <p style="margin: 4px 0 0 0; font-size: 14px;">Appointment Confirmation</p>
              </div>
              <div style="padding: 20px 0;">
                <p>Dear <strong>${payload.name}</strong>,</p>
                <p>Your appointment has been confirmed with Lahore Dental. Here are your details:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Patient Name:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">${payload.name}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Phone:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">${payload.phone}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Date:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">${payload.date}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Time:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">${payload.time}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Procedure / Reason:</td><td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">${payload.reason || "General Consultation"}</td></tr>
                </table>
                <div style="background-color: #f0f9ff; padding: 12px; border-radius: 8px; margin-top: 20px;">
                  <p style="margin: 0; color: #0369a1; font-size: 14px;">📍 <strong>Clinic Address:</strong> Plaza 42-B, Main Boulevard, Gulberg III, Lahore, Pakistan<br>📞 <strong>Helpline:</strong> +92 300 1234567</p>
                </div>
              </div>
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">Please arrive 10 minutes prior to your booking. If you need to reschedule, please call us.</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[Resend API Error]:", errorText);
        return false;
      }

      console.log(`[Resend Email] Sent confirmation to ${toEmail}`);
      return true;
    } catch (error) {
      console.error("[Resend Email] Exception:", error);
      return false;
    }
  }

  // Graceful simulated delivery when Resend API key is not set
  console.log(`[Simulated Resend Email] Sent booking confirmation for ${payload.name} to ${toEmail}`);
  return true;
}
