'use client';
export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";
import { useState } from "react";


async function openverseImage(query: string): Promise<string | null> {
    const imageLink = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=1`;
    const image = await fetch(imageLink);

    if (!image.ok)
        return null;

    const json = await image.json() as {
        results: {
            thumbnail?: string;
            url?: string
        }[]
    };

    if (!json.results?.length)
        return null;

    return json.results[0].thumbnail || json.results[0].url || null;
}


export default function AddHighlightPage() {
    const router = useRouter();
    const [submit, setSubmit] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmit(true);

        const form = new FormData(event.currentTarget);
        const title = form.get("title") as string;
        const location = form.get("location") as string;
        const description = form.get("description") as string;

        try {
            const img = await openverseImage(title);
            if (!img) throw new Error('Could not find an image for that name.');

            const saved = await fetch(
                "/api/postreview",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        location,
                        description,
                    }),
                }
            );
            if (!saved.ok)
                throw new Error('Failed to submit review');
            router.push("/");
        }
        catch {
            setError('Error adding new Highlight');
        }

        finally {
            setSubmit(false);
        }
    }
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4">
                <header className=" flex items-center justify-between border-b border-gray-400 pb-3">
                    <h1 className="text-xl font-bold text-left">
                        Create a highlight
                    </h1>

                    <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                        X
                    </button>
                </header>
                <label className="block">
                    <span className="text-sm font-medium">Highlight Name</span>
                    <input
                        title="title"
                        required
                        className="mt-1 w-full rounded border p-2 border-gray-300"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Location</span>
                    <input
                        title="location"
                        required
                        className="mt-1 w-full rounded border p-2 border-gray-300"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Description</span>
                    <textarea
                        title="description"
                        rows={4}
                        required
                        className="mt-1 w-full rounded border p-2 border-gray-300"
                    />
                </label>

                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className=" flex gap-2 justify-end">
                    <button
                        className="p-4 border border-red-500 bg-white hover:bg-gray-200 text-black rounded-lg py-2 font-semibold disabled:opacity-50"
                        onClick={() => router.push('/')}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submit}
                        className=" p-4 bg-red-500 hover:bg-red-400 text-white rounded-lg py-2 font-semibold disabled:opacity-50 ">
                        {submit ? 'Confirming...' : 'Confirm'}
                    </button>
                </div>
            </form>
        </main>
    );
}