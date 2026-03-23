"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { getRandomPrompt, prompts } from "@/lib/prompts";
import { createSupabaseBrowserClient, insertResponse, type ResponseType } from "@/lib/supabase";

const ACCEPT_BY_TYPE: Record<Exclude<ResponseType, "text">, string> = {
  audio: "audio/*",
  video: "video/*",
};
const MAX_MEDIA_SIZE_BYTES = 50 * 1024 * 1024;

type CaptureMode = "upload" | "record";

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

export function SubmissionForm() {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState<string>(getRandomPrompt());
  const [responseType, setResponseType] = useState<ResponseType>("text");
  const [captureMode, setCaptureMode] = useState<CaptureMode>("upload");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparingRecorder, setIsPreparingRecorder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }

      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = null;
      }
    };
  }, [recordedUrl]);

  function resetRecordingState() {
    mediaRecorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    recordedChunksRef.current = [];
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
    setIsRecording(false);
    setIsPreparingRecorder(false);
  }

  function clearRecordedPreview() {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    setRecordedBlob(null);
    setRecordedUrl("");
  }

  function handleTypeChange(nextType: ResponseType) {
    setResponseType(nextType);
    setCaptureMode("upload");
    setFile(null);
    setTextContent("");
    clearRecordedPreview();
    resetRecordingState();
    setError("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;

    if (nextFile && nextFile.size > MAX_MEDIA_SIZE_BYTES) {
      setFile(null);
      setError(`Please keep ${responseType} files under ${formatFileSize(MAX_MEDIA_SIZE_BYTES)}.`);
      return;
    }

    setError("");
    setFile(nextFile);
  }

  function handleCaptureModeChange(nextMode: CaptureMode) {
    setCaptureMode(nextMode);
    setFile(null);
    clearRecordedPreview();
    resetRecordingState();
    setError("");
  }

  async function startRecording() {
    if (responseType === "text") {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser does not support direct recording. Please upload a file instead.");
      return;
    }

    setError("");
    clearRecordedPreview();
    setIsPreparingRecorder(true);

    try {
      const constraints =
        responseType === "audio"
          ? { audio: true, video: false }
          : { audio: true, video: { facingMode: "user" } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const mimeType =
        responseType === "audio" && MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : responseType === "video" && MediaRecorder.isTypeSupported("video/webm")
            ? "video/webm"
            : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const nextBlob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || (responseType === "audio" ? "audio/webm" : "video/webm"),
        });

        if (nextBlob.size > MAX_MEDIA_SIZE_BYTES) {
          clearRecordedPreview();
          setRecordedBlob(null);
          setRecordedUrl("");
          setError(`That recording is too large. Please keep it under ${formatFileSize(MAX_MEDIA_SIZE_BYTES)}.`);
          mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
          setIsRecording(false);
          return;
        }

        clearRecordedPreview();
        setRecordedBlob(nextBlob);
        setRecordedUrl(URL.createObjectURL(nextBlob));
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);

      if (responseType === "video" && liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        void liveVideoRef.current.play().catch(() => {});
      }
    } catch {
      setError("We couldn't access your microphone/camera. Please check permissions or upload a file.");
      resetRecordingState();
    } finally {
      setIsPreparingRecorder(false);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
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
        const mediaSource =
          captureMode === "record"
            ? recordedBlob
              ? new File([recordedBlob], `${responseType}-memory.webm`, {
                  type: recordedBlob.type || (responseType === "audio" ? "audio/webm" : "video/webm"),
                })
              : null
            : file;

        if (!mediaSource) {
          throw new Error(
            captureMode === "record"
              ? `Please record your ${responseType} before submitting.`
              : `Please choose a ${responseType} file.`,
          );
        }

        if (isRecording) {
          throw new Error("Please stop the recording before submitting.");
        }

        if (mediaSource.size > MAX_MEDIA_SIZE_BYTES) {
          throw new Error(`Please keep ${responseType} files under ${formatFileSize(MAX_MEDIA_SIZE_BYTES)}.`);
        }

        content = await uploadFile(mediaSource, responseType);
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
      clearRecordedPreview();
      resetRecordingState();
      setPrompt(getRandomPrompt());
      setResponseType("text");
      setCaptureMode("upload");
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
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-cocoa">How would you like to add it?</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {(["upload", "record"] as CaptureMode[]).map((mode) => {
                  const isSelected = captureMode === mode;

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleCaptureModeChange(mode)}
                      className={`rounded-2xl px-4 py-3 text-sm font-medium capitalize transition ${
                        isSelected
                          ? "bg-cocoa text-white"
                          : "border border-cocoa/10 bg-white text-cocoa hover:border-rose/40"
                      }`}
                    >
                      {mode === "upload" ? "Upload file" : `Record ${responseType}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {captureMode === "upload" ? (
              <div>
                <label className="text-sm font-medium text-cocoa" htmlFor="upload">
                  Upload your {responseType}
                </label>
                <p className="mt-2 text-sm text-cocoa/60">
                  Maximum file size: {formatFileSize(MAX_MEDIA_SIZE_BYTES)}.
                </p>
                <input
                  id="upload"
                  type="file"
                  accept={ACCEPT_BY_TYPE[responseType]}
                  onChange={handleFileChange}
                  className="mt-2 block w-full rounded-2xl border border-dashed border-cocoa/20 bg-white px-4 py-4 text-sm text-cocoa/75 file:mr-4 file:rounded-full file:border-0 file:bg-rose file:px-4 file:py-2 file:font-medium file:text-white"
                />
                {file ? <p className="mt-2 text-sm text-cocoa/65">{file.name}</p> : null}
              </div>
            ) : (
              <div className="rounded-[1.5rem] bg-white/85 p-5">
                <p className="text-sm text-cocoa/70">
                  Record right here in the browser, then preview it before sending. Keep recordings under{" "}
                  {formatFileSize(MAX_MEDIA_SIZE_BYTES)}.
                </p>

                {responseType === "video" ? (
                  <div className="mt-4 overflow-hidden rounded-[1.25rem] bg-cocoa/10">
                    {recordedUrl ? (
                      <video controls src={recordedUrl} className="aspect-video w-full object-cover" />
                    ) : (
                      <video
                        ref={liveVideoRef}
                        muted
                        playsInline
                        className="aspect-video w-full object-cover"
                      />
                    )}
                  </div>
                ) : recordedUrl ? (
                  <audio controls src={recordedUrl} className="mt-4 w-full" />
                ) : null}

                <div className="mt-4 flex flex-wrap gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={isPreparingRecorder}
                      className="rounded-full bg-rose px-5 py-3 text-sm font-medium text-white transition hover:bg-rose/90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {recordedBlob ? "Record again" : isPreparingRecorder ? "Preparing..." : `Start ${responseType} recording`}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="rounded-full bg-cocoa px-5 py-3 text-sm font-medium text-white transition hover:bg-cocoa/90"
                    >
                      Stop recording
                    </button>
                  )}

                  {recordedBlob ? (
                    <button
                      type="button"
                      onClick={() => {
                        clearRecordedPreview();
                        resetRecordingState();
                      }}
                      className="rounded-full border border-cocoa/10 bg-white px-5 py-3 text-sm font-medium text-cocoa transition hover:border-rose/40"
                    >
                      Clear take
                    </button>
                  ) : null}
                </div>
              </div>
            )}
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
