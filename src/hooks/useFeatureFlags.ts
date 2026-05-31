import { useFeatureFlags as useFeatureFlagsContext } from '@/contexts/FeatureFlagsContext'
import type { FeatureFlags } from '@/config/featureFlags'

export function useFeatureFlags() {
  return useFeatureFlagsContext()
}

export function useFlag(flag: keyof FeatureFlags): boolean {
  const { isEnabled } = useFeatureFlagsContext()
  return isEnabled(flag)
}
