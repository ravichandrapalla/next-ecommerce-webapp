import Footer from "@/components/footer";
import Header from "@/components/shared/header";
import { APP_NAME } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: `%s | Ecommerce-app`,
    default: APP_NAME,
  },
  description: "a next.js built webapp",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 wrapper">{children}</main>
      <Footer />
    </div>
  );
}
