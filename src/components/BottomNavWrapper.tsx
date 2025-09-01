import { getSessionServer } from "@/lib/session";
import BottomNav from "./BottomNav";

export default async function BottomNavWrapper() {
  const session = await getSessionServer();
  
  return <BottomNav session={session} />;
}
