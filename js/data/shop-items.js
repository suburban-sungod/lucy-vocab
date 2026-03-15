export const SHOP_CATEGORIES = [
  { id: 'themes', name: 'Themes', icon: '\u{1F3A8}' },
  { id: 'skins', name: 'Card Skins', icon: '\u{2728}' },
  { id: 'celebrations', name: 'Celebrations', icon: '\u{1F389}' },
];

export const SHOP_ITEMS = [
  // Themes
  { id: 'theme-dark', category: 'themes', name: 'Dark Mode', price: 50, themeId: 'dark', preview: '#0f172a' },
  { id: 'theme-sakura', category: 'themes', name: 'Sakura', price: 100, themeId: 'sakura', preview: '#ec4899' },
  { id: 'theme-ocean', category: 'themes', name: 'Ocean', price: 100, themeId: 'ocean', preview: '#38bdf8' },
  { id: 'theme-sunset', category: 'themes', name: 'Sunset', price: 150, themeId: 'sunset', preview: '#f97316' },
  { id: 'theme-neon', category: 'themes', name: 'Neon', price: 200, themeId: 'neon', preview: '#34d399' },
  { id: 'theme-midnight', category: 'themes', name: 'Midnight', price: 200, themeId: 'midnight', preview: '#a5b4fc' },

  // Card skins
  { id: 'skin-gradient', category: 'skins', name: 'Gradient', price: 75, cssClass: 'skin-gradient' },
  { id: 'skin-glass', category: 'skins', name: 'Glass', price: 100, cssClass: 'skin-glass' },
  { id: 'skin-neon-border', category: 'skins', name: 'Neon Glow', price: 150, cssClass: 'skin-neon-border' },

  // Celebrations
  { id: 'celeb-stars', category: 'celebrations', name: 'Stars', price: 50, effectId: 'stars' },
  { id: 'celeb-hearts', category: 'celebrations', name: 'Hearts', price: 75, effectId: 'hearts' },
  { id: 'celeb-sparkle', category: 'celebrations', name: 'Sparkle', price: 100, effectId: 'sparkle' },
  { id: 'celeb-rainbow', category: 'celebrations', name: 'Rainbow', price: 200, effectId: 'rainbow' },
];
