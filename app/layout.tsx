import type { Metadata } from "next";
import { El_Messiri, Tajawal } from "next/font/google";
import "./globals.css";

const elMessiri = El_Messiri({
  variable: "--font-el-messiri",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "سند — منصة الدعم الاجتماعي",
  description: "منصة إخاء الأهلية لرعاية الأيتام",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${elMessiri.variable} ${tajawal.variable}`}>
        {children}
      </body>
    </html>
  );
}
