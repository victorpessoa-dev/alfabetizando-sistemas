import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function DashboardLayout({ children }) {
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />

                <div className="flex-1 flex flex-col">
                    <Topbar />
                    <main className="p-6">{children}</main>
                </div>
            </div>
        </ProtectedRoute>
    )
}
