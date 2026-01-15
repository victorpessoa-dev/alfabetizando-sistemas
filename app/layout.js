import "./globals.css"

export const metadata = {
  title: "Alfabetizando Sistemas",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
