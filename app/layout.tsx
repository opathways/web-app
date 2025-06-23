import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/app.css";
import "@aws-amplify/ui-react/styles.css";
import AmplifyProvider from "@/components/AmplifyProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Employer Portal – Dashboard",
  description: "Employer dashboard and job management interface"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <AmplifyProvider>
          {children}
        </AmplifyProvider>
      </body>
    </html>
  );
}
