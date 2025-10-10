import { getRobotsData } from "@/actions/dashboard";
import Dashboard from "@/components/Dashboard";

export default async function HomePage() {
  const { robots, lastUpdate } = await getRobotsData();

  return <Dashboard initialRobots={robots} initialLastUpdate={lastUpdate} />;
}


