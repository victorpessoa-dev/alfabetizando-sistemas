import Link from "next/link"
import Image from "next/image"

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <main className="flex-1 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <Image
                                src="/logo_sistema.png"
                                alt="Alfabetizando Sistemas"
                                width={150}
                                height={150}
                                className="object-contain"
                            />
                        </div>

                        <h1 className="text-3xl font-bold text-blue-600 mb-2">
                            Alfabetizando Sistemas
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Sistema de gestão para escolinhas de reforço
                        </p>

                        <div className="space-y-3">
                            <Link
                                href="/login"
                                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition text-center font-medium"
                            >
                                Entrar no sistema
                            </Link>
                            <Link
                                href="/register"
                                className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition text-center font-medium"
                            >
                                Criar conta
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-4 text-center text-sm text-gray-600">
                © {new Date().getFullYear()} Alfabetizando Sistemas. Todos os direitos reservados.
            </footer>
        </div>
    )
}
