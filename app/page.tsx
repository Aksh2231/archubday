import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-6 py-16">
      <section className="animate-fadeUp rounded-[2rem] border border-white/70 bg-white/65 px-8 py-12 shadow-card backdrop-blur-xl md:px-12">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-rose/80">Birthday Memory App</p>
        <h1 className="max-w-3xl font-display text-5xl leading-tight text-cocoa md:text-7xl">
          Build Archana&apos;s birthday surprise out of stories, voices, and little moments.
        </h1>
        <p className="mt-6 max-w-2xl balance-text text-lg leading-8 text-cocoa/80">
          Friends can leave a sweet note, an audio memory, or a short video. When it&apos;s time,
          Archana gets to guess who sent each one.
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
      </section>
    </main>
  );
}
