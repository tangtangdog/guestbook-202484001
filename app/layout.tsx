import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "방명록",
  description: "이름과 한 줄 메시지를 남기는 미니 방명록",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Nanum+Pen+Script&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
