import "./globals.css";

export const metadata = {
    title: "Alfabetizando Sistemas",
    description: "Sistema de gestão para escolinhas de reforço",
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body>
                {children}
            </body>
        </html>
    );
}
