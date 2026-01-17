import "./globals.css"
import Providers from "./providers"

export const metadata = {
  title: "Alfabetizando Sistemas - Gestão de Reforço Escolar",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </Providers>
      </body>
    </html>
  )
}
