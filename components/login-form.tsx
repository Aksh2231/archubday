"use client";

import { useEffect, useMemo, useState } from "react";

const ANSWER = "ACHUKINS";
const MAX_GUESSES = 6;
const WORD_LENGTH = ANSWER.length;
const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

type TileState = "correct" | "present" | "absent" | "empty";
type KeyState = Record<string, Exclude<TileState, "empty">>;

function evaluateGuess(guess: string, answer: string) {
  const result: TileState[] = Array.from({ length: answer.length }, () => "absent");
  const remainingLetters = answer.split("");

  guess.split("").forEach((letter, index) => {
    if (answer[index] === letter) {
      result[index] = "correct";
      remainingLetters[index] = "";
    }
  });

  guess.split("").forEach((letter, index) => {
    if (result[index] === "correct") {
      return;
    }

    const matchIndex = remainingLetters.indexOf(letter);

    if (matchIndex !== -1) {
      result[index] = "present";
      remainingLetters[matchIndex] = "";
    }
  });

  return result;
}

function getTileClasses(state: TileState) {
  switch (state) {
    case "correct":
      return "border-emerald-500 bg-emerald-500 text-white";
    case "present":
      return "border-amber-400 bg-amber-400 text-white";
    case "absent":
      return "border-cocoa/15 bg-cocoa/35 text-white";
    default:
      return "border-cocoa/10 bg-white text-cocoa";
  }
}

function mergeKeyState(
  current: Exclude<TileState, "empty"> | undefined,
  next: Exclude<TileState, "empty">,
): Exclude<TileState, "empty"> {
  const priority: Record<Exclude<TileState, "empty">, number> = {
    absent: 0,
    present: 1,
    correct: 2,
  };

  if (!current) {
    return next;
  }

  return priority[next] > priority[current] ? next : current;
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  const evaluations = useMemo(() => {
    return guesses.map((guess) => evaluateGuess(guess, ANSWER));
  }, [guesses]);

  const keyboardState = useMemo(() => {
    return guesses.reduce<KeyState>((accumulator, guess, guessIndex) => {
      const states = evaluations[guessIndex];

      guess.split("").forEach((letter, letterIndex) => {
        const nextState = states[letterIndex];
        if (nextState === "empty") {
          return;
        }

        accumulator[letter] = mergeKeyState(accumulator[letter], nextState);
      });

      return accumulator;
    }, {});
  }, [evaluations, guesses]);

  async function unlockWithAnswer() {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: ANSWER.toLowerCase() }),
      });

      const data = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok || !data.success) {
        setError(data.message ?? "Unable to unlock the dashboard.");
        setIsSolved(false);
        return;
      }

      window.location.href = nextPath;
    } catch {
      setError("Something went wrong while unlocking the dashboard.");
      setIsSolved(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  function submitGuess() {
    if (isSubmitting || isSolved) {
      return;
    }

    if (currentGuess.length !== WORD_LENGTH) {
      setError(`The nickname has ${WORD_LENGTH} letters.`);
      return;
    }

    const normalizedGuess = currentGuess.toUpperCase();
    const nextGuesses = [...guesses, normalizedGuess];
    setGuesses(nextGuesses);
    setCurrentGuess("");
    setError("");

    if (normalizedGuess === ANSWER) {
      setIsSolved(true);
      void unlockWithAnswer();
      return;
    }

    if (nextGuesses.length >= MAX_GUESSES) {
      setError("One more peek at your gifts might help with the hint.");
    }
  }

  function handleKeyPress(key: string) {
    if (isSubmitting || isSolved) {
      return;
    }

    if (key === "ENTER") {
      submitGuess();
      return;
    }

    if (key === "BACKSPACE") {
      setCurrentGuess((value) => value.slice(0, -1));
      setError("");
      return;
    }

    if (!/^[A-Z]$/.test(key) || currentGuess.length >= WORD_LENGTH || guesses.length >= MAX_GUESSES) {
      return;
    }

    setCurrentGuess((value) => `${value}${key}`);
    setError("");
  }

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleKeyPress("ENTER");
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        handleKeyPress("BACKSPACE");
        return;
      }

      if (/^[a-zA-Z]$/.test(event.key)) {
        handleKeyPress(event.key.toUpperCase());
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [currentGuess, guesses, isSolved, isSubmitting]);

  return (
    <section className="rounded-[1.75rem] border border-cocoa/10 bg-gradient-to-br from-white to-blush p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.2em] text-cocoa/50">Password Hint</p>
      <p className="mt-4 text-base leading-7 text-cocoa/80">
        A nickname your friends gave you in college
      </p>

      <div className="mt-6 space-y-2">
        {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
          const guess = guesses[rowIndex] ?? (rowIndex === guesses.length ? currentGuess : "");
          const evaluation = guesses[rowIndex] ? evaluations[rowIndex] : [];

          return (
            <div key={rowIndex} className="grid grid-cols-8 gap-2">
              {Array.from({ length: WORD_LENGTH }, (_, columnIndex) => {
                const letter = guess[columnIndex] ?? "";
                const state = guesses[rowIndex]
                  ? evaluation[columnIndex]
                  : letter
                    ? "empty"
                    : "empty";

                return (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className={`flex aspect-square items-center justify-center rounded-2xl border text-lg font-semibold uppercase transition md:text-xl ${getTileClasses(
                      state,
                    )}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-2">
        {KEYBOARD_ROWS.map((row) => (
          <div key={row} className="flex justify-center gap-2">
            {row.split("").map((letter) => {
              const state = keyboardState[letter] ?? "empty";
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => handleKeyPress(letter)}
                  className={`min-w-8 rounded-xl border px-2 py-3 text-xs font-semibold uppercase transition md:min-w-10 md:text-sm ${getTileClasses(
                    state,
                  )}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ))}

        <div className="flex justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleKeyPress("ENTER")}
            className="rounded-xl border border-cocoa/10 bg-cocoa px-4 py-3 text-xs font-semibold uppercase text-white transition hover:bg-cocoa/90 md:text-sm"
          >
            Enter
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("BACKSPACE")}
            className="rounded-xl border border-cocoa/10 bg-white px-4 py-3 text-xs font-semibold uppercase text-cocoa transition hover:border-rose/40 md:text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-rose">{error}</p> : null}
      {isSolved && !error ? (
        <p className="mt-4 text-sm text-emerald-700">
          Correct. Unlocking the birthday dashboard...
        </p>
      ) : null}
    </section>
  );
}
