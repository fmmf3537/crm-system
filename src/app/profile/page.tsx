import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ProfileForms } from "@/components/profile/profile-forms"
import { getCurrentUserFromRequest } from "@/lib/auth"

export const metadata: Metadata = {
  title: "个人中心",
}

export default async function ProfilePage() {
  const user = await getCurrentUserFromRequest()
  if (!user) {
    redirect("/login?redirectTo=/profile")
  }

  return <ProfileForms user={user} />
}

