import { RobotStats } from "@/lib/types";
import DashboardClient from "./DashboardClient";

interface DashboardServerProps {
  initialRobots: RobotStats[];
  initialLastUpdate: string;
}

export default function DashboardServer({
  initialRobots,
  initialLastUpdate,
}: DashboardServerProps) {
  return (
    <DashboardClient
      initialRobots={initialRobots}
      initialLastUpdate={initialLastUpdate}
    />
  );
}
