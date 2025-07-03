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
  imageLink: string | null;
};

async function openverseImage(query: string): Promise<string | null> {
  const imageLink = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=1`;
  const [error, setError] = useState('');
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

  const link = json.results[0].thumbnail || json.results[0].url || null;

  if (link) {
    try {
      const head = await fetch(link, { method: "HEAD" });
      if (!head.ok)
        return null;
      const isImg = head.headers.get("content-type") || "";
      if (!isImg.startsWith("image/"))
        return null;
    } catch {
      return null; //just ignore
    }
  }
  return link;
}

export default function Home() {
  const router = useRouter();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const getReviews = await fetch(`/api/getreviews`, { cache: "no-store" });
        const info: apiHighlight[] = await getReviews.json();



        const highlightImages: Highlight[] = await Promise.all(
          info.map(async (highlight) => {
            const img = await openverseImage(highlight.title);

            return {
              uniqueId: uuid(),
              title: highlight.title,
              location: highlight.location,
              description: highlight.description,
              imageLink: img ?? null,
            };
          })
        );
        setHighlights((highlightImages).reverse());
      }
      catch {
        setError('Error getting Highlight from API try with a different title');
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

        <section className="w-fit flex-none max-w-[71ch] p-3">
          <h2 className="text-[28px] text-black text-pretty font-bold pb-2">
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

              {highlights.filter(highlight => highlight.imageLink).map(highlight =>
                <div key={highlight.uniqueId} className=" flex flex-col overflow-hidden bg-white rounded-2xl min-h-[170px] mb-4 p-3">
                  <div className="relative aspect-video overflow-hidden flex justify-center ">
                    <Image
                      src={highlight.imageLink as string}
                      sizes="(max-width: 768px) 100vw,(max-width: 1280px) 50vw, 33vw"
                      fill
                      alt={highlight.title}
                      className="object-cover rounded-2xl"
                    />
                  </div>
                  <div className=" pt-3 break-words">
                    <h3 className="font-semibold">{highlight.title}</h3>
                    <p className="text-sm text-gray-600">{highlight.location}</p>
                    <p className="text-sm">{highlight.description}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
        <button className="fixed bottom-4 right-4 z-50 bg-red-500 rounded-xl p-3 hover:bg-red-400 text-white"
          onClick={() => router.push('/addhighlight')}>
          Create +
        </button>
      </div>
    </>
  );
}
