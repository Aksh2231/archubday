import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const nextPath = resolvedSearchParams.next ?? "/dashboard";

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-16">
      <div className="grid w-full gap-8 rounded-[2rem] border border-white/70 bg-white/65 p-8 shadow-card backdrop-blur-xl md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <section className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-rose/80">Private entry</p>
          <h1 className="font-display text-4xl text-cocoa md:text-5xl">
            Archana&apos;s guessing game starts here.
          </h1>
          <p className="max-w-lg text-base leading-7 text-cocoa/75">
            Enter the birthday password to unlock the memory wall and see each message grouped by
            prompt. Every card starts anonymous until the guess is made.
          </p>
          <div className="story-ring relative hidden rounded-[1.75rem] bg-gradient-to-br from-blush via-cream to-peach p-8 md:block">
            <p className="text-sm uppercase tracking-[0.2em] text-cocoa/55">Inside the dashboard</p>
            <ul className="mt-4 space-y-3 text-cocoa/80">
              <li>Anonymous messages grouped by prompt</li>
              <li>Text, audio, and video memories in one place</li>
              <li>Guess, reveal, and celebrate each sender</li>
            </ul>
          </div>
        </section>
        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
