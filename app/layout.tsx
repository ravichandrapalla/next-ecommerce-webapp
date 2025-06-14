import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "@/assets/styles/globals.css";
import {
  APP_DESCRIPTION,
  APP_NAME,
  SERVER_URL,
} from "./../lib/constants/index";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
