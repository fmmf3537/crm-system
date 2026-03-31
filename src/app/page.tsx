import { redirect } from "next/navigation";

import { getCurrentUserFromRequest } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUserFromRequest();
  if (!user) {
    redirect("/login");
  }

  redirect("/dashboard");
}
