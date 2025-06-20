import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./app.css";
import Layout from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Employer Portal - Manage Jobs & Applications",
  description: "Employer dashboard for managing company profiles, job postings, and applications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
