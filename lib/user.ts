import { getCurrentUser } from './auth'

export async function getUserProfile() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return null
    }

    // Return user data with additional dashboard stats
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      problemsSolved: 42,
      recentlySolved: 5,
      globalRank: 128,
      rankChange: 15,
      contestsWon: 2,
      totalContests: 8,
      rating: 1850,
      ratingChange: 75,
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}