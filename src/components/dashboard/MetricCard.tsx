
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

export default function MetricCard({
  title,
  value,
  Icon,
  iconColor = "text-blue-600",
  bgColor = "bg-blue-100",
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center p-4">
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
