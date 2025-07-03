import { NextResponse, NextRequest } from "next/server";

const getLink = `https://surgetakehome.vercel.app/api/getreviews/kestrel`

export async function GET() {
    const res = await fetch(getLink, { cache: "no-store" });

    if (!res.ok) {
        return NextResponse.json({ error: `Upstream ${res.status}` }, { status: res.status });
    }

    const imgInfo = await res.json();
    return NextResponse.json(imgInfo);
}
