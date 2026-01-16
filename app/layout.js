import "./globals.css"

export const metadata = {
  title: "Alfabetizando Sistemas - Gestão de Reforço Escolar",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
