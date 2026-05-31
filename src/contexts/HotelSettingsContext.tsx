'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Settings = Database['public']['Tables']['settings']['Row']
type Hotel    = Database['public']['Tables']['hotels']['Row']

interface HotelSettingsContextValue {
  hotel:           Hotel | null
  settings:        Settings | null
  isLoading:       boolean
  refreshSettings: () => Promise<void>
}

const HotelSettingsContext = createContext<HotelSettingsContextValue | null>(null)

export function HotelSettingsProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()

  const [hotel,     setHotel]     = useState<Hotel | null>(null)
  const [settings,  setSettings]  = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: hotelData } = await supabase
        .from('hotels')
        .select('*')
        .single()

      if (hotelData) {
        setHotel(hotelData)

        const { data: settingsData } = await supabase
          .from('settings')
          .select('*')
          .eq('hotel_id', hotelData.id)
          .single()

        setSettings(settingsData ?? null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const refreshSettings = useCallback(async () => {
    await fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return (
    <HotelSettingsContext.Provider
      value={{ hotel, settings, isLoading, refreshSettings }}
    >
      {children}
    </HotelSettingsContext.Provider>
  )
}

export function useHotelSettings(): HotelSettingsContextValue {
  const context = useContext(HotelSettingsContext)
  if (!context) {
    throw new Error('useHotelSettings must be used within a HotelSettingsProvider')
  }
  return context
}
