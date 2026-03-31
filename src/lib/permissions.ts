import type { SafeUser, User } from "@/types/user"

export function canAccessByOwnership(
  current: SafeUser,
  recordOwnerId: string | undefined,
  allUsers: User[],
): boolean {
  if (current.role === "admin") return true
  if (!recordOwnerId) return false

  if (current.role === "sales") {
    return recordOwnerId === current.id
  }

  // manager
  const managerTeam = current.teamId
  if (!managerTeam) {
    return recordOwnerId === current.id
  }

  const owner = allUsers.find((u) => u.id === recordOwnerId)
  if (!owner) return false
  return owner.teamId === managerTeam
}

export function filterByOwnership<T extends { ownerId?: string }>(
  current: SafeUser,
  records: T[],
  allUsers: User[],
): T[] {
  if (current.role === "admin") return records
  return records.filter((r) => canAccessByOwnership(current, r.ownerId, allUsers))
}

