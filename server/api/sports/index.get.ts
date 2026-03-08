import { useDrizzle } from '../../utils/drizzle'
import { sports } from '../../db/schema'

export default defineEventHandler(async () => {
  const db = useDrizzle()
  const allSports = await db.select().from(sports).orderBy(sports.label)

  return {
    success: true,
    data: allSports
  }
})
