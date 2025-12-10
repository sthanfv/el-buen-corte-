import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase";
import { OrderSchema } from "@/schemas/order";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate Input
        const validatedOrder = OrderSchema.parse(body);

        const ref = await adminDb.collection("orders").add({
            ...validatedOrder,
            createdAt: new Date().toISOString(),
            status: "pending" // Default status
        });

        return NextResponse.json({ ok: true, id: ref.id });
    } catch (e: any) {
        console.error("Error creating order:", e);
        return NextResponse.json({ error: e.message || "Error creating order" }, { status: 500 });
    }
}
