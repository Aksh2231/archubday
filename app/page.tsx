import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-6 py-16">
      <section className="animate-fadeUp rounded-[2rem] border border-white/70 bg-white/65 px-8 py-12 shadow-card backdrop-blur-xl md:px-12">
        <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-rose/80">Birthday Memory App</p>
            <h1 className="max-w-4xl font-display text-5xl leading-tight text-cocoa md:text-7xl">
              Archu&apos;s Birthday Wall: A little corner for your favorite things &amp; memories
              about Archana.
            </h1>
            <p className="mt-6 max-w-2xl balance-text text-lg leading-8 text-cocoa/80">
              Leave a sweet note, an audio memory, or a short video. When it&apos;s time, she also
              gets to guess who sent each one.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/submit"
                className="rounded-full bg-rose px-6 py-3 text-center font-medium text-white transition hover:scale-[1.01] hover:bg-rose/90"
              >
                Leave a memory
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-cocoa/10 bg-white/80 px-6 py-3 text-center font-medium text-cocoa transition hover:border-rose/40 hover:text-rose"
              >
                Open the birthday dashboard
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[480px]">
            <div className="absolute inset-8 rounded-[2rem] bg-gradient-to-br from-rose/15 via-white/20 to-mint/25 blur-3xl" />
            <div className="relative grid min-h-[420px] grid-cols-2 gap-4 rounded-[2rem] border border-white/80 bg-gradient-to-br from-white/85 via-blush/45 to-cream/80 p-5 shadow-card">
              <div className="rounded-[1.75rem] bg-gradient-to-br from-peach/90 to-white p-4 shadow-sm">
                <div className="relative h-full min-h-[180px] overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/80">
                  <Image
                    src="/archu-collage-1.jpg"
                    alt="Archu standing outdoors in a white outfit"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 240px"
                  />
                  <div className="absolute inset-x-4 bottom-4 rounded-[1rem] bg-white/72 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cocoa/55 backdrop-blur-md">
                    Sunshine Archu
                  </div>
                </div>
              </div>

              <div className="mt-10 rounded-[1.75rem] bg-gradient-to-br from-white to-mint/70 p-4 shadow-sm">
                <div className="relative h-full min-h-[140px] overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/80">
                  <Image
                    src="/archu-collage-2.jpg"
                    alt="Archu sitting on a bed smiling"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 220px"
                  />
                  <div className="absolute inset-x-4 bottom-4 rounded-[1rem] bg-white/72 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cocoa/55 backdrop-blur-md">
                    Cozy Archu
                  </div>
                </div>
              </div>

              <div className="-mt-6 rounded-[1.75rem] bg-gradient-to-br from-white to-blush/75 p-4 shadow-sm">
                <div className="relative h-full min-h-[135px] overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/80">
                  <Image
                    src="/archu-collage-3.jpg"
                    alt="Archu smiling at a cafe table"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 220px"
                  />
                  <div className="absolute inset-x-4 bottom-4 rounded-[1rem] bg-white/72 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cocoa/55 backdrop-blur-md">
                    Candid Archu
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] bg-gradient-to-br from-cream to-white p-4 shadow-sm">
                <div className="relative flex h-full min-h-[185px] items-end overflow-hidden rounded-[1.35rem] border border-dashed border-cocoa/15 bg-white/80 p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-cocoa/45">More Photos Soon</p>
                    <p className="mt-3 text-sm leading-6 text-cocoa/60">
                      This tile is ready for the next Archu memory once you send more photos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
