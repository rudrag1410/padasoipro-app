import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Feather>['name'];

/** Icon names come from the API; fall back rather than render nothing if one is unknown. */
export function toIconName(name: string, fallback: IconName = 'grid'): IconName {
  return name in Feather.glyphMap ? (name as IconName) : fallback;
}
