import type React from "react"
import { Inter } from "next/font/google"
import { CssBaseline } from "@mui/material"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter"
import ThemeProvider from "@/components/theme-provider"
import './globals.css'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
