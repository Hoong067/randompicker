const PROFESSIONAL = {
  name: 'Professional',
  colors: {
    background: '#F8FAFF',
    primary: '#4F46E5',
    accent: '#06B6D4',
    surface: '#FFFFFF',
    text: '#0F172A',
    muted: '#6B7280',
    danger: '#EF4444',
    chipBg: '#EEF2FF',
    cardBg: '#FFFFFF'
  },
  palette: ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#F97316', '#7C3AED'],
  spacing: { xs: 6, sm: 12, md: 16, lg: 24, xl: 32 },
  r: 12,
  shadow: { elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12 }
};

const OCEAN = {
  name: 'Ocean',
  colors: {
    background: '#E6F7FF',
    primary: '#0EA5E9',
    accent: '#06B6D4',
    surface: '#FFFFFF',
    text: '#04263A',
    muted: '#4B5563',
    danger: '#EF4444',
    chipBg: '#E0F2FE',
    cardBg: '#FFFFFF'
  },
  palette: ['#0EA5E9', '#06B6D4', '#38BDF8', '#7DD3FC', '#34D399', '#60A5FA'],
  spacing: { xs: 6, sm: 12, md: 16, lg: 24, xl: 32 },
  r: 12,
  shadow: { elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10 }
};

const SUNSET = {
  name: 'Sunset',
  colors: {
    background: '#FFF7ED',
    primary: '#FB923C',
    accent: '#F97316',
    surface: '#FFFFFF',
    text: '#2B2B2B',
    muted: '#6B7280',
    danger: '#DC2626',
    chipBg: '#FFF1E6',
    cardBg: '#FFFFFF'
  },
  palette: ['#FB923C', '#F97316', '#F43F5E', '#FDE68A', '#FBCFE8'],
  spacing: { xs: 6, sm: 12, md: 16, lg: 24, xl: 32 },
  r: 12,
  shadow: { elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10 }
};

const MIDNIGHT = {
  name: 'Midnight',
  colors: {
    background: '#0b1020',
    primary: '#8B5CF6',
    accent: '#06B6D4',
    surface: '#0F172A',
    text: '#E6EEF8',
    muted: '#94A3B8',
    danger: '#FB7185',
    chipBg: '#111827',
    cardBg: '#0B1220'
  },
  palette: ['#8B5CF6', '#06B6D4', '#60A5FA', '#A78BFA', '#F472B6'],
  spacing: { xs: 6, sm: 12, md: 16, lg: 24, xl: 32 },
  r: 12,
  shadow: { elevation: 3, shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14 }
};

const FOREST = {
  name: 'Forest',
  colors: {
    background: '#F0FBF3',
    primary: '#0F9D58',
    accent: '#34D399',
    surface: '#FFFFFF',
    text: '#06361A',
    muted: '#4B5563',
    danger: '#DC2626',
    chipBg: '#E6F9EF',
    cardBg: '#FFFFFF'
  },
  palette: ['#0F9D58', '#34D399', '#60A5FA', '#A3E635', '#10B981'],
  spacing: { xs: 6, sm: 12, md: 16, lg: 24, xl: 32 },
  r: 12,
  shadow: { elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10 }
};

const PASTEL = {
  name: 'Pastel',
  colors: {
    background: '#FFF7FB',
    primary: '#F472B6',
    accent: '#FDE68A',
    surface: '#FFFFFF',
    text: '#2B2B2B',
    muted: '#6B7280',
    danger: '#EF4444',
    chipBg: '#FFF1F6',
    cardBg: '#FFFFFF'
  },
  palette: ['#F472B6', '#FDE68A', '#A78BFA', '#93C5FD', '#FBCFE8'],
  spacing: { xs: 6, sm: 12, md: 16, lg: 24, xl: 32 },
  r: 12,
  shadow: { elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10 }
};

const MONOCHROME = {
  name: 'Monochrome',
  colors: {
    background: '#F7F7F8',
    primary: '#374151',
    accent: '#6B7280',
    surface: '#FFFFFF',
    text: '#0F172A',
    muted: '#6B7280',
    danger: '#DC2626',
    chipBg: '#F3F4F6',
    cardBg: '#FFFFFF'
  },
  palette: ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6'],
  spacing: { xs: 6, sm: 12, md: 16, lg: 24, xl: 32 },
  r: 12,
  shadow: { elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 }
};

const CANDY = {
  name: 'Candy',
  colors: {
    background: '#FFF1F8',
    primary: '#FB7185',
    accent: '#F472B6',
    surface: '#FFFFFF',
    text: '#2B2B2B',
    muted: '#6B7280',
    danger: '#EF4444',
    chipBg: '#FFF3F6',
    cardBg: '#FFFFFF'
  },
  palette: ['#FB7185', '#F472B6', '#FDE68A', '#FBCFE8', '#FECACA'],
  spacing: { xs: 6, sm: 12, md: 16, lg: 24, xl: 32 },
  r: 12,
  shadow: { elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10 }
};

const PRESET_THEMES = {
  Professional: PROFESSIONAL,
  Ocean: OCEAN,
  Sunset: SUNSET,
  Midnight: MIDNIGHT,
  Forest: FOREST,
  Pastel: PASTEL,
  Monochrome: MONOCHROME,
  Candy: CANDY
};

const DEFAULT_THEME = PROFESSIONAL;

export default DEFAULT_THEME;
export { PRESET_THEMES };
