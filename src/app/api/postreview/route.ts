import { NextResponse, NextRequest } from "next/server";

const postLink = `https://surgetakehome.vercel.app/api/postreview/kestrel`

export async function POST(req: NextRequest) {
    const { title, location, description } = await req.json();

    const upstream = await fetch(postLink, {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ title, location, description }),
    },);

    if (!upstream.ok) {
        return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: upstream.status });
    }

    const responseData = await upstream.json();
    return NextResponse.json(responseData);
}