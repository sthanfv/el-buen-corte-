import { Card, CardContent } from "@/components/ui/card"

export function ProductSkeleton() {
    return (
        <Card className="overflow-hidden border-none bg-white shadow-xl animate-pulse">
            <div className="h-64 bg-gray-200" />
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-12" />
                </div>
                <div className="h-10 bg-gray-200 rounded w-full mt-4" />
                <div className="flex justify-between items-center pt-2">
                    <div className="h-8 bg-gray-200 rounded w-24" />
                    <div className="h-10 bg-gray-200 rounded w-28" />
                </div>
            </CardContent>
        </Card>
    )
}
