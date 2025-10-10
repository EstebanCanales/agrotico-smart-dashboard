
import {
  Users,
  Activity,
  Database,
} from "lucide-react";
import MetricCard from "./MetricCard";
import { RobotStats } from "@/lib/types";

interface MetricsGridProps {
  robots: RobotStats[];
}

export default function MetricsGrid({ robots }: MetricsGridProps) {
  const totalRobots = robots.length;
  const activeRobots = robots.filter((robot) => robot.estado === "activo").length;
  const totalReadings = robots.reduce(
    (sum, robot) => sum + ((robot as any).total_readings || 0),
    0
  );
  const averageReadings = totalRobots > 0 ? Math.round(totalReadings / totalRobots) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Robots"
        value={totalRobots}
        Icon={Users}
        iconColor="text-blue-600"
        bgColor="bg-blue-100"
      />
      <MetricCard
        title="Robots Activos"
        value={activeRobots}
        Icon={Activity}
        iconColor="text-green-600"
        bgColor="bg-green-100"
      />
      <MetricCard
        title="Total Lecturas"
        value={totalReadings.toLocaleString("es-ES")}
        Icon={Database}
        iconColor="text-purple-600"
        bgColor="bg-purple-100"
      />
      <MetricCard
        title="Promedio Lecturas"
        value={averageReadings}
        Icon={Activity}
        iconColor="text-orange-600"
        bgColor="bg-orange-100"
      />
    </div>
  );
}
