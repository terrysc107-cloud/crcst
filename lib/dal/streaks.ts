// Pure function — calculates consecutive-day streak from an array of ISO timestamps.
export function calculateStreak(createdAtTimestamps: string[]): number {
  if (!createdAtTimestamps.length) return 0

  const uniqueDays = [
    ...new Set(
      createdAtTimestamps.map((ts) => {
        const d = new Date(ts)
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      })
    ),
  ].sort().reverse()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`

  if (uniqueDays[0] !== todayStr && uniqueDays[0] !== yesterdayStr) return 0

  let streak = 1
  let checkDate = new Date(uniqueDays[0] === todayStr ? today : yesterday)

  for (let i = 1; i < uniqueDays.length; i++) {
    checkDate.setDate(checkDate.getDate() - 1)
    const checkStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`
    if (uniqueDays[i] === checkStr) {
      streak++
    } else {
      break
    }
  }
  return streak
}
