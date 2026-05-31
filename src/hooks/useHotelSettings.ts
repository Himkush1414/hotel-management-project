import { useHotelSettings as useHotelSettingsContext } from '@/contexts/HotelSettingsContext'

export function useHotelSettings() {
  return useHotelSettingsContext()
}
