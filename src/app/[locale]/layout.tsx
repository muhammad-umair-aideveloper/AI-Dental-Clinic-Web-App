import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "../globals.css";

export const viewport: Viewport = {
  themeColor: "#38bdf8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isUrdu = locale === "ur";

  return {
    title: isUrdu
      ? "لاہور ڈینٹل — جدید دانتوں کا علاج اور اے آئی بکنگ"
      : "Lahore Dental — AI-Powered Dental Clinic in Gulberg, Lahore",
    description: isUrdu
      ? "لاہور میں جدید ترین ٹیکنالوجی، تکلیف سے پاک دندان سازی، اور 24/7 اے آئی اسسٹنٹ کے ساتھ دانتوں کا معتبر کلینک۔"
      : "Premier pain-free dental clinic in Gulberg, Lahore. Equipped with digital dentistry and Pakistan's first 24/7 AI dental appointment assistant.",
    keywords: [
      "Dental Clinic Lahore",
      "Dentist in Gulberg",
      "Teeth Whitening Lahore",
      "Painless Root Canal",
      "Dental Implants Pakistan",
      "Clear Aligners Lahore",
      "لاہور ڈینٹل",
      "ڈینٹسٹ لاہور",
    ],
    authors: [{ name: "Lahore Dental Care" }],
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      title: "Lahore Dental — AI-Powered Dental Clinic",
      description: "Book pain-free dental appointments instantly via our AI assistant.",
      locale: locale === "ur" ? "ur_PK" : "en_US",
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === "ur" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className={`min-h-screen antialiased selection:bg-sky-200 selection:text-sky-900 ${locale === "ur" ? "font-urdu" : "font-sans"}`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
