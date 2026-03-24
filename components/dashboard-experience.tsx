"use client";

import confetti from "canvas-confetti";
import Image from "next/image";
import { useMemo, useState } from "react";
import { type MemoryResponse } from "@/lib/supabase";

type GuessState = {
  guess: string;
  revealed: boolean;
  isCorrect: boolean | null;
};

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function renderContent(response: MemoryResponse) {
  if (response.type === "audio") {
    return (
      <audio controls className="mt-4 w-full">
        <source src={response.content} />
        Your browser does not support audio playback.
      </audio>
    );
  }

  if (response.type === "video") {
    return (
      <video controls className="mt-4 w-full rounded-2xl">
        <source src={response.content} />
        Your browser does not support video playback.
      </video>
    );
  }

  return <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-cocoa/80">{response.content}</p>;
}

function isGuessable(response: MemoryResponse) {
  return response.type === "text";
}

function playRevealChime() {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextClass = window.AudioContext ?? (window as typeof window & {
    webkitAudioContext?: typeof AudioContext;
  }).webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const now = audioContext.currentTime;
  const notes = [523.25, 659.25, 783.99];

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const startTime = now + index * 0.1;
    const endTime = startTime + 0.22;

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.08, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime);
  });

  window.setTimeout(() => {
    void audioContext.close();
  }, 600);
}

function launchRevealConfetti() {
  void confetti({
    particleCount: 120,
    spread: 78,
    startVelocity: 34,
    origin: { y: 0.62 },
    colors: ["#ff7e9d", "#ffd7ba", "#fff3cf", "#dff7ea", "#c4b0ff"],
  });
}

export function DashboardExperience({ responses }: { responses: MemoryResponse[] }) {
  const groupedResponses = useMemo(() => {
    return responses.reduce<Record<string, MemoryResponse[]>>((accumulator, response) => {
      accumulator[response.prompt] = accumulator[response.prompt] ?? [];
      accumulator[response.prompt].push(response);
      return accumulator;
    }, {});
  }, [responses]);

  const [started, setStarted] = useState(false);
  const [guessState, setGuessState] = useState<Record<string, GuessState>>({});

  function updateGuess(id: string, nextGuess: string) {
    setGuessState((current) => ({
      ...current,
      [id]: {
        guess: nextGuess,
        revealed: current[id]?.revealed ?? false,
        isCorrect: current[id]?.isCorrect ?? null,
      },
    }));
  }

  function revealResponse(response: MemoryResponse) {
    const guess = guessState[response.id]?.guess ?? "";
    const isCorrect = normalizeName(guess) === normalizeName(response.name);

    setGuessState((current) => ({
      ...current,
      [response.id]: {
        guess,
        revealed: true,
        isCorrect,
      },
    }));

    launchRevealConfetti();
    playRevealChime();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-card backdrop-blur-xl">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-rose/80">Birthday dashboard</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl leading-tight text-cocoa md:text-6xl">
              A whole room full of voices, memories, and tiny pieces of love for Archana.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-cocoa/75">
              Text memories stay anonymous for the guessing game. Audio and video memories show their
              sender right away, so Archana can just enjoy hearing and seeing them.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="rounded-full bg-cocoa px-6 py-3 font-medium text-white transition hover:bg-cocoa/90"
              >
                {started ? "Keep going" : "Start opening memories"}
              </button>
              <p className="text-sm text-cocoa/60">
                {responses.length} memories collected across {Object.keys(groupedResponses).length} prompts
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[360px]">
            <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-cocoa/25 via-rose/15 to-peach/20 blur-3xl" />
            <div className="relative flex min-h-[290px] items-end justify-center overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-b from-[#5f4a61] via-[#7a5d73] to-[#f3a0ac] p-6 shadow-[0_24px_60px_rgba(93,67,88,0.24)]">
              <div className="absolute inset-x-6 top-6 h-16 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute inset-x-10 bottom-4 h-24 rounded-full bg-[#ffd7ba]/18 blur-3xl" />
              <Image
                src="/archu-dashboard.png"
                alt="Archu on the birthday dashboard"
                width={540}
                height={540}
                className="relative z-10 h-auto max-h-[340px] w-auto object-contain drop-shadow-[0_24px_44px_rgba(93,67,88,0.2)]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {started ? (
        Object.entries(groupedResponses).map(([prompt, promptResponses]) => (
          <section
            key={prompt}
            className="rounded-[2rem] border border-white/70 bg-white/65 p-8 shadow-card backdrop-blur-xl"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cocoa/45">Prompt</p>
                <h2 className="mt-2 font-display text-3xl text-cocoa">{prompt}</h2>
              </div>
              <p className="text-sm text-cocoa/60">{promptResponses.length} response(s)</p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {promptResponses.map((response, index) => {
                const state = guessState[response.id] ?? {
                  guess: "",
                  revealed: false,
                  isCorrect: null,
                };

                const guessable = isGuessable(response);

                return (
                  <article
                    key={response.id}
                    className="story-ring relative rounded-[1.75rem] bg-gradient-to-br from-white to-blush p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-cocoa/45">
                        {guessable ? `Anonymous memory #${index + 1}` : `Memory #${index + 1}`}
                      </p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium capitalize text-cocoa/65">
                        {response.type}
                      </span>
                    </div>

                    {renderContent(response)}

                    {guessable ? (
                      <div className="mt-6 rounded-[1.5rem] bg-white/80 p-4">
                        <label className="text-sm font-medium text-cocoa" htmlFor={`guess-${response.id}`}>
                          Who do you think sent this?
                        </label>
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                          <input
                            id={`guess-${response.id}`}
                            value={state.guess}
                            onChange={(event) => updateGuess(response.id, event.target.value)}
                            className="flex-1 rounded-full border border-cocoa/10 bg-white px-4 py-3 outline-none transition focus:border-rose/40 focus:ring-2 focus:ring-rose/20"
                            placeholder="Type a name"
                          />
                          <button
                            type="button"
                            onClick={() => revealResponse(response)}
                            className="rounded-full bg-rose px-5 py-3 font-medium text-white transition hover:bg-rose/90"
                          >
                            Reveal
                          </button>
                        </div>

                        {state.revealed ? (
                          <div className="mt-4 rounded-2xl bg-cream px-4 py-3 text-sm text-cocoa/80">
                            <p>{state.isCorrect ? "Correct guess." : "Not quite, but here’s the answer."}</p>
                            <p className="mt-1 font-medium">This memory was from {response.name}.</p>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-6 rounded-[1.5rem] bg-white/80 p-4 text-sm text-cocoa/80">
                        <p className="font-medium">From {response.name}</p>
                        <p className="mt-1 text-cocoa/65">
                          Audio and video memories don&apos;t use the guessing game.
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))
      ) : (
        <section className="rounded-[2rem] border border-dashed border-cocoa/20 bg-white/40 p-10 text-center text-cocoa/65">
          Press “Start opening memories” when Archana is ready for the big reveal.
        </section>
      )}
    </div>
  );
}
