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
import {
  DEFAULT_FEATURE_FLAGS,
  type FeatureFlags,
} from '@/config/featureFlags'

interface FeatureFlagsContextValue {
  flags:        FeatureFlags
  isLoading:    boolean
  isEnabled:    (flag: keyof FeatureFlags) => boolean
  refreshFlags: () => Promise<void>
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null)

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()

  const [flags,     setFlags]     = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS)
  const [isLoading, setIsLoading] = useState(true)

  const fetchFlags = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase
        .from('feature_flags')
        .select('flag_key, is_enabled')

      if (data && data.length > 0) {
        const flagMap = { ...DEFAULT_FEATURE_FLAGS }
        data.forEach(({ flag_key, is_enabled }) => {
          if (flag_key in flagMap) {
            flagMap[flag_key as keyof FeatureFlags] = is_enabled
          }
        })
        setFlags(flagMap)
      }
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const refreshFlags = useCallback(async () => {
    await fetchFlags()
  }, [fetchFlags])

  const isEnabled = useCallback(
    (flag: keyof FeatureFlags): boolean => flags[flag],
    [flags]
  )

  useEffect(() => {
    fetchFlags()
  }, [fetchFlags])

  return (
    <FeatureFlagsContext.Provider
      value={{ flags, isLoading, isEnabled, refreshFlags }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export function useFeatureFlags(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext)
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider')
  }
  return context
}
