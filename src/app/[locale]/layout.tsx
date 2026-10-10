import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DialogProvider } from "@/components/ui/DialogProvider";
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
      icon: "/images/logo.png",
      shortcut: "/images/logo.png",
      apple: "/images/logo.png",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap"
        />
        {locale === "ur" && (
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
          />
        )}
      </head>
      <body className={`min-h-screen bg-white text-[#0F172A] antialiased selection:bg-[#4FB8A6]/20 selection:text-[#2E9C89] ${locale === "ur" ? "font-urdu" : "font-sans"}`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <DialogProvider>{children}</DialogProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
