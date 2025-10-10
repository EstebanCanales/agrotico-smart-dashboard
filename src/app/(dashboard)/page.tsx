import { getRobotsData } from "@/actions/dashboard";
import Dashboard from "@/components/Dashboard";

export default async function DashboardPage() {
  const { robots, lastUpdate } = await getRobotsData();

  return <Dashboard initialRobots={robots} initialLastUpdate={lastUpdate} />;
}