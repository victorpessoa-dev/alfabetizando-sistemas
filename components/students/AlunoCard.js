import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"

export default function StudentCard({ student, href }) {
    return (
        <Link href={href}>
            <Card className="w-full p-6 flex items-center justify-between hover:shadow-md transition cursor-pointer min-h-[80px] max-h-[100px]">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden border flex items-center justify-center bg-muted shrink-0">
                        {student.photo_url ? (
                            <Image
                                src={student.photo_url}
                                alt={student.name_completo}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover object-center"
                            />
                        ) : (
                            <span className="text-lg font-bold text-primary">
                                {student.name_completo?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col justify-center">

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
