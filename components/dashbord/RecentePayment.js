"use client"

export default function RecentPayments({ payments }) {
    return (
        <div className="space-y-2">
            {payments.map((p) => (
                <div
                    key={p.id}
                    className="flex justify-between border-b pb-2"
                >
                    <span>{p.student?.name_completo}</span>
                    <span
                        className={
                            p.paid ? "text-green-600" : "text-red-600"
                        }
                    >
                        R$ {p.amount}
                    </span>
                </div>
            ))}
        </div>
    )
}
