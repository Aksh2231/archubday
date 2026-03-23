"use client";

import { FormEvent, useState } from "react";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok || !data.success) {
        setError(data.message ?? "Unable to log in.");
        return;
      }

      window.location.href = nextPath;
    } catch {
      setError("Something went wrong while logging in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border border-cocoa/10 bg-gradient-to-br from-white to-blush p-6 shadow-sm"
    >
      <p className="text-sm uppercase tracking-[0.2em] text-cocoa/50">Password</p>
      <label className="mt-6 block text-sm font-medium text-cocoa" htmlFor="password">
        Birthday dashboard password
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-cocoa/10 bg-white px-4 py-3 outline-none transition focus:border-rose/40 focus:ring-2 focus:ring-rose/20"
        placeholder="Enter password"
        required
      />
      {error ? <p className="mt-3 text-sm text-rose">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-full bg-cocoa px-5 py-3 font-medium text-white transition hover:bg-cocoa/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Unlocking..." : "Unlock dashboard"}
      </button>
    </form>
  );
}
