import { DashboardExperience } from "@/components/dashboard-experience";
import { fetchResponses } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getResponses() {
  const { data, error } = await fetchResponses();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export default async function DashboardPage() {
  const responses = await getResponses();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <DashboardExperience responses={responses} />
    </main>
  );
}
