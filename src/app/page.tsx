'use client'
export const dynamic = 'force-dynamic';
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { v4 as uuid } from "uuid";

type apiHighlight = {
  title: string;
  location: string;
  description: string;
};

type Highlight = {
  uniqueId: string;
  title: string;
  location: string;
  description: string;
  imageLink: string;
};

async function openverseImage(query: string): Promise<string | null> {
  const imageLink = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=1`;
  const image = await fetch(imageLink);
  if (!image.ok)
    return null;
  const json = await image.json() as { results: { thumbnail?: string; url?: string }[] };
  if (!json.results?.length)
    return null;

  return json.results[0].thumbnail || json.results[0].url || null;
}

export default function Home() {
  const router = useRouter();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const getReviews = await fetch("https://surgetakehome.vercel.app/api/getreviews/kestrel");
        const info: apiHighlight[] = await getReviews.json();

        const highlightImages: Highlight[] = await Promise.all(
          info.map(async (highlight) => {
            const img = await openverseImage(highlight.title);
            return {
              uniqueId: uuid(),
              title: highlight.title,
              location: highlight.location,
              description: highlight.description,
              imageLink: img ?? "",
            };
          })
        );
        setHighlights(highlightImages);
      }
      catch {
        setError('Error getting Highlight from API');
      }

      finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <div className=" px-[5%] pt-[3%] align-top">
        <h1 className=" pl-3  pt-3 text-xs text-orange-500 font-bold">HIGHLIGHTS</h1>

        <section className="w-fit flex-none max-w-[68ch] p-3">
          <h2 className="text-3xl text-black text-pretty">
            What are the special moments of your life?
          </h2>
          <p className="text-gray-800 hyphens-auto text-base">
            We believe every moment counts! Share your favourite highlights, unforgettable memories, and the memories that make your life shine.
          </p>
        </section>

        {loading && (
          <p className="text-center text-gray-500 mt-8">Loading highlights…</p>
        )}

        {error && (
          <p className="text-center text-red-600 mt-8 font-medium">{error}</p>
        )}

        {!loading && !error && (
          <div className=" flex justify-center">
            <div className=" columns-1 min-[755px]:columns-2 xl:columns-3 gap-4 p-4">
              {highlights.map(highlight =>
                <div key={highlight.uniqueId} className=" flex flex-col overflow-hidden bg-gray-100 rounded-2xl min-h-[170px] mb-4">
                  <div className="relative h-[160px] w-full overflow-hidden m-1 mt-4 flex justify-center ">
                    <Image
                      src={highlight.imageLink}
                      height={160} width={320}
                      alt={highlight.title}
                      className="object-cover rounded-2xl"
                    />
                  </div>
                  <div className="p-4 break-words">
                    <h3 className="font-semibold">{highlight.title}</h3>
                    <p className="text-sm text-gray-600">{highlight.location}</p>
                    <p className="text-sm">{highlight.description}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
        <button className="fixed right-4 z-50 bg-red-500 rounded-xl p-3 hover:bg-red-400"
          onClick={() => router.push('/addhighlight')}>
          Create +
        </button>
      </div>
    </>
  );
}
