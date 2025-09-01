import { getSessionServer } from "@/lib/session";
import Nav from "./Nav";

export default async function NavWrapper() {
  const session = await getSessionServer();
  return <Nav session={session} />;
}
