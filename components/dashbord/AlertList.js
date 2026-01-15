"use client"

export default function Alerts({ alerts }) {
    if (alerts.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Nenhum alerta 🎉
            </p>
        )
    }

    return (
        <ul className="space-y-2">
            {alerts.map((a, i) => (
                <li
                    key={i}
                    className="bg-red-100 text-red-700 p-2 rounded"
                >
                    {a}
                </li>
            ))}
        </ul>
    )
}
