import { retrieveValue, storeValue } from '@/utils/storage'

export interface FeatureFlagDefinition {
  name: string
  description: string
  defaultValue: boolean
}

export const featureFlagDefinitions: FeatureFlagDefinition[] = [
  {
    name: 'useWebsockets',
    description: 'Use websockets',
    defaultValue: false,
  },
  {
    name: 'refreshStaleData',
    description: 'Refresh stale data when tab becomes visible',
    defaultValue: false,
  },
]

export const FEATURE_FLAG_PREFIX = 'featureFlags.'

export const getFeatureFlag = (
  name: string,
  defaultValue: boolean,
): boolean => retrieveValue<boolean>(FEATURE_FLAG_PREFIX + name, defaultValue)

export const setFeatureFlag = (name: string, value: boolean): void => {
  storeValue<boolean>(FEATURE_FLAG_PREFIX + name, value)
}
