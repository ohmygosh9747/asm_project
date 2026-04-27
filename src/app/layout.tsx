import type { Metadata } from "next";
<<<<<<< HEAD
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
=======
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
>>>>>>> f04e20575b112f284b1efdeb812b6cc0d0fbd454
  subsets: ["latin"],
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Admin Management System",
  description: "Admin Management System with Super Admin and Admin roles",
=======
  title: "Arabian Shield Manpower - ASM",
  description: "Private manpower management application for Arabian Shield Manpower",
  keywords: ["ASM", "Manpower", "Management", "HR", "Arabian Shield"],
  authors: [{ name: "Arabian Shield Manpower" }],
  icons: {
    icon: "/logo.svg",
  },
>>>>>>> f04e20575b112f284b1efdeb812b6cc0d0fbd454
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
<<<<<<< HEAD
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
        <Toaster />
=======
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
>>>>>>> f04e20575b112f284b1efdeb812b6cc0d0fbd454
      </body>
    </html>
  );
}
