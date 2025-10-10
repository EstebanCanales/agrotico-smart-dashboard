import { getCurrentSensorData } from "@/actions/ai";
import AIChatInterface from "@/components/ai/AIChatInterface";

export default async function AIPage() {
  const initialSensorData = await getCurrentSensorData();

  return <AIChatInterface initialSensorData={initialSensorData} />;
}
