/**
 * React Hook for fetching dashboard statistics
 * Fetches real data from API or falls back to mock data
 */

import { useState, useEffect } from 'react'
import { mockCategoryCounts, mockTimeline30d } from './mock'
import { isMockDataEnabled } from './tenantUtils'

interface CategoryCounts {
  Phish: number
  Malware: number
  Spam: number
  BEC: number
  ATO: number
}

interface TimelineData {
  date: string
  total: number
  quarantined: number
  delivered: number
}

interface StatsData {
  categoryCounts: Array<{ category: string; count: number; description: string }>
  timeline: Array<{ date: string; quarantined: number; delivered: number }>
  stats?: {
    totalEvents: number
    quarantined: number
    blocked: number
    allowed: number
  }
  source?: string
}

export function useStats(customerId: string | null) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<StatsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        // If mock data is enabled, use mock data directly
        if (isMockDataEnabled(customerId)) {
          const categoryCounts = mockCategoryCounts(customerId)
          const timeline = mockTimeline30d(customerId)
          
          // Convert category counts to array format
          const categoryCountsArray = Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            count,
            description: getCategoryDescription(category)
          }))

          // Convert timeline to match API format
          const timelineArray = timeline.map(t => ({
            date: t.date,
            quarantined: t.quarantined,
            delivered: t.delivered
          }))

          setData({
            categoryCounts: categoryCountsArray,
            timeline: timelineArray,
            source: 'mock'
          })
          setLoading(false)
          return
        }

        // Fetch real data from API
        const response = await fetch('/api/reports/stats', {
          headers: customerId ? { 'x-customer-id': customerId } : {}
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`)
        }

        const result = await response.json()
        
        if (result.success && result.data) {
          setData(result.data)
        } else {
          // Fall back to mock data if API returns error
          const categoryCounts = mockCategoryCounts(customerId)
          const timeline = mockTimeline30d(customerId)
          
          const categoryCountsArray = Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            count,
            description: getCategoryDescription(category)
          }))

          const timelineArray = timeline.map(t => ({
            date: t.date,
            quarantined: t.quarantined,
            delivered: t.delivered
          }))

          setData({
            categoryCounts: categoryCountsArray,
            timeline: timelineArray,
            source: 'fallback'
          })
        }
      } catch (err: any) {
        console.error('Error fetching stats:', err)
        setError(err.message || 'Failed to load statistics')
        
        // Fall back to mock data on error
        const categoryCounts = mockCategoryCounts(customerId)
        const timeline = mockTimeline30d(customerId)
        
        const categoryCountsArray = Object.entries(categoryCounts).map(([category, count]) => ({
          category,
          count,
          description: getCategoryDescription(category)
        }))

        const timelineArray = timeline.map(t => ({
          date: t.date,
          quarantined: t.quarantined,
          delivered: t.delivered
        }))

        setData({
          categoryCounts: categoryCountsArray,
          timeline: timelineArray,
          source: 'error-fallback'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [customerId])

  return { data, loading, error }
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    'Phish': 'Phishing emails attempting to steal credentials',
    'Malware': 'Malware attachments or links',
    'Spam': 'Unsolicited bulk emails',
    'BEC': 'Business Email Compromise attacks',
    'ATO': 'Account Takeover attempts',
  }
  return descriptions[category] || `Security events in ${category} category`
}

