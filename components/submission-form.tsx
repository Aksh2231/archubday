"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { getRandomPrompt, prompts } from "@/lib/prompts";
import { createSupabaseBrowserClient, insertResponse, type ResponseType } from "@/lib/supabase";

const ACCEPT_BY_TYPE: Record<Exclude<ResponseType, "text">, string> = {
  audio: "audio/*",
  video: "video/*",
};

export function SubmissionForm() {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState<string>(getRandomPrompt());
  const [responseType, setResponseType] = useState<ResponseType>("text");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleTypeChange(nextType: ResponseType) {
    setResponseType(nextType);
    setFile(null);
    setTextContent("");
    setError("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  async function uploadFile(fileToUpload: File, type: Exclude<ResponseType, "text">) {
    const supabase = createSupabaseBrowserClient();
    const extension = fileToUpload.name.split(".").pop() ?? "bin";
    const path = `${type}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from("uploads").upload(path, fileToUpload, {
      cacheControl: "3600",
      upsert: false,
      contentType: fileToUpload.type,
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      let content = textContent.trim();

      if (responseType === "text" && !content) {
        throw new Error("Please add your memory before submitting.");
      }

      if (responseType !== "text") {
        if (!file) {
          throw new Error(`Please choose a ${responseType} file.`);
        }

        content = await uploadFile(file, responseType);
      }

      const { error: insertError } = await insertResponse({
        name: name.trim(),
        prompt,
        type: responseType,
        content,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setName("");
      setTextContent("");
      setFile(null);
      setPrompt(getRandomPrompt());
      setResponseType("text");
      setSuccess("Your memory is safely tucked away. You can send another one anytime.");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "We couldn't save your response.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-card backdrop-blur-xl"
    >
      <div className="grid gap-6">
        <div>
          <label className="text-sm font-medium text-cocoa" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-cocoa/10 bg-white px-4 py-3 outline-none transition focus:border-rose/40 focus:ring-2 focus:ring-rose/20"
            placeholder="So Archana knows who sent it"
            required
          />
          <p className="mt-2 text-sm text-cocoa/60">
            You can submit again after this if you want to send another memory in a different format.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-cocoa" htmlFor="prompt">
              Prompt
            </label>
            <button
              type="button"
              onClick={() => setPrompt(getRandomPrompt())}
              className="text-sm font-medium text-rose transition hover:text-cocoa"
            >
              Shuffle prompt
            </button>
          </div>
          <select
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-cocoa/10 bg-white px-4 py-3 outline-none transition focus:border-rose/40 focus:ring-2 focus:ring-rose/20"
          >
            {prompts.map((promptOption) => (
              <option key={promptOption} value={promptOption}>
                {promptOption}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-cocoa">Response type</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {(["text", "audio", "video"] as ResponseType[]).map((option) => {
              const isSelected = responseType === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleTypeChange(option)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium capitalize transition ${
                    isSelected
                      ? "bg-cocoa text-white"
                      : "border border-cocoa/10 bg-white text-cocoa hover:border-rose/40"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {responseType === "text" ? (
          <div>
            <label className="text-sm font-medium text-cocoa" htmlFor="memory">
              Your memory
            </label>
            <textarea
              id="memory"
              value={textContent}
              onChange={(event) => setTextContent(event.target.value)}
              rows={6}
              className="mt-2 w-full rounded-3xl border border-cocoa/10 bg-white px-4 py-3 outline-none transition focus:border-rose/40 focus:ring-2 focus:ring-rose/20"
              placeholder="Write something warm, silly, grateful, or deeply specific."
            />
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium text-cocoa" htmlFor="upload">
              Upload your {responseType}
            </label>
            <input
              id="upload"
              type="file"
              accept={ACCEPT_BY_TYPE[responseType]}
              onChange={handleFileChange}
              className="mt-2 block w-full rounded-2xl border border-dashed border-cocoa/20 bg-white px-4 py-4 text-sm text-cocoa/75 file:mr-4 file:rounded-full file:border-0 file:bg-rose file:px-4 file:py-2 file:font-medium file:text-white"
            />
            {file ? <p className="mt-2 text-sm text-cocoa/65">{file.name}</p> : null}
          </div>
        )}

        {error ? <p className="text-sm text-rose">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-rose px-5 py-3 font-medium text-white transition hover:scale-[1.01] hover:bg-rose/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving your memory..." : "Submit memory"}
        </button>
      </div>
    </form>
  );
}
