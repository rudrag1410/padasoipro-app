import { Platform, type ViewStyle } from 'react-native';

/** padosipro.com --card-shadow: 0 2px 20px rgba(0,0,0,.04) */
export const cardShadow: ViewStyle = Platform.select({
  web: { boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)' } as ViewStyle,
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
});
