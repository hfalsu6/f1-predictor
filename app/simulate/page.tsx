import { redirect } from "next/navigation";
import { fetchRaceSchedule, getFutureRaces } from "@/lib/api/schedule";

export const revalidate = 3600;

export default async function SimulatePage() {
  const schedule = await fetchRaceSchedule();
  const future = getFutureRaces(schedule);
  if (future.length === 0) redirect("/standings");
  redirect(`/simulate/${future[0].round}`);
}
