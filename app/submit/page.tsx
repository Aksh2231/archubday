import { SubmissionForm } from "@/components/submission-form";

export default function SubmitPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6 rounded-[2rem] border border-white/70 bg-white/65 p-8 shadow-card backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-rose/80">Memory dropbox</p>
          <h1 className="font-display text-4xl text-cocoa md:text-5xl">
            Leave Archana a birthday surprise.
          </h1>
          <p className="text-base leading-7 text-cocoa/75">
            Pick a prompt, choose a format, and send something heartfelt. You can submit more than
            once, so feel free to leave a text memory, then come back with an audio note or a video too.
            You can upload media files or record audio and video directly in the browser.
          </p>
          <div className="rounded-[1.75rem] bg-gradient-to-br from-cream to-blush p-6">
            <p className="font-medium text-cocoa">A few helpful notes</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-cocoa/75">
              <li>You can send multiple memories in any format, even back to back.</li>
              <li>Use your real name so text submissions can work in the guessing game.</li>
              <li>Audio and video can be uploaded or recorded directly before sending.</li>
              <li>Keep audio and video files under 50 MB.</li>
              <li>Try to keep recordings around 30-40 seconds so they upload and play smoothly.</li>
            </ul>
          </div>
        </section>
        <SubmissionForm />
      </div>
    </main>
  );
}
