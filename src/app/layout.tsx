import type { Metadata } from "next";
import Script from "next/script";
import {
  createWhatsAppUrl,
  WHATSAPP_REQUIREMENTS_MESSAGE,
} from "@/lib/contact";
import "./globals.css";

const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
const isGoogleAnalyticsConfigured = /^G-[A-Z0-9]+$/.test(
  googleAnalyticsId ?? "",
);

export const metadata: Metadata = {
  title: "Dandeli Direct | Stays and activities in Dandeli",
  description:
    "Book verified Dandeli stays and reserved activities with clear package pricing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        {isGoogleAnalyticsConfigured && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');`}
            </Script>
          </>
        )}
        <a
          href={createWhatsAppUrl(WHATSAPP_REQUIREMENTS_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Dandeli Direct on WhatsApp"
          className="fixed bottom-5 right-5 z-50 rounded-md bg-[#25D366] px-5 py-3 font-semibold text-[#102c27] shadow-md transition-colors hover:bg-[#62e38f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Chat on WhatsApp
        </a>
      </body>
    </html>
  );
}
