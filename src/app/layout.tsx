import type { Metadata } from "next"
import { Roboto, Inter } from "next/font/google"
import { IntlProvider } from "@/components/providers/IntlProvider"
import { ToastProvider } from "@/components/ui"
import "./globals.css"

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MyExpertPay",
  description: "Expertpay account management portal",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${inter.variable}`}>
      <body>
        <IntlProvider>
          <ToastProvider>{children}</ToastProvider>
        </IntlProvider>
      </body>
    </html>
  )
}
