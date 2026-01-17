import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"

export default function StudentCard({ student, href }) {
    return (
        <Link href={href}>
            <Card className="p-4 hover:shadow-md transition cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full overflow-hidden border flex items-center justify-center bg-muted">
                        {student.photo_url ? (
                            <Image
                                src={student.photo_url}
                                alt={student.name_completo}
                                width={56}
                                height={56}
                                className="h-full w-full object-cover object-center"
                            />
                        ) : (
                            <span className="text-lg font-bold text-primary">
                                {student.name_completo?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div>
                        <p className="font-semibold leading-tight">
                            {student.name_completo}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Série: {student.grade}
                        </p>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
