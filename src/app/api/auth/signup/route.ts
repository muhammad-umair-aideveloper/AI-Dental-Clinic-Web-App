import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Patient account creation is not supported. Appointments and reports are managed directly via phone and verified WhatsApp links without requiring a login.",
    },
    { status: 403 }
  );
}
