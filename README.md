# Birthday Memory App

A pastel Next.js app for collecting birthday memories for Archana, with a text-only guessing game and direct reveals for audio/video.

## Stack

- Next.js App Router
- Tailwind CSS
- Supabase database and storage

## Setup

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Add these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_PASSWORD=your-dashboard-password
```

4. Create the Supabase table and storage bucket
5. Run the app with `npm run dev`

## Supabase schema

```sql
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prompt text not null,
  type text not null check (type in ('text', 'audio', 'video')),
  content text not null,
  created_at timestamp with time zone default now()
);
```

Create a public storage bucket named `uploads`.

## Suggested policies

This app uses the anonymous Supabase key, so `responses` inserts/selects and `uploads` storage uploads need policies that allow the behavior you want for your event.

Typical setup:

- Public `insert` on `responses`
- Public `select` on `responses`
- Public `insert` and `select` on storage objects in the `uploads` bucket

## Pages

- `/submit` for friends to leave one or more text, audio, or video memories, either by upload or direct recording
- `/login` for password entry
- `/dashboard` for the text guessing-game and audio/video reveal experience
