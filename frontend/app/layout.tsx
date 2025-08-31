import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { CartProvider } from "@/app/context/CartContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Head from "next/head";
import { authService } from '@/lib/api-auth';
import AuthProviderWrapper from "@/app/context/AuthProviderWrapper"; // import the wrapper
import SlidingCart from '@/components/sliding-cart';
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DXRKICE",
  description: "Design your dream clothing with AI and we'll manufacture it",
};



export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user on server before rendering
  let user = null;
  try {
    user = await authService.getProfile(); // Your server-side user fetch
  } catch (error) {
    // user stays null if not logged in or error
  }

  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
      </Head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Pass user as prop to AuthProviderWrapper */}
          <AuthProviderWrapper initialUser={user}>
          <CartProvider>
            {children}
            <Toaster />
            </CartProvider>
          </AuthProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
