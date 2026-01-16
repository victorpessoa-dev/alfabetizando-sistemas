import "./globals.css"
import Providers from "./providers"

export const metadata = {
  title: "Alfabetizando Sistemas - Gestão de Reforço Escolar",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
