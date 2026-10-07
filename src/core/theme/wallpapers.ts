export type WallpaperId = 'none' | 'clouds' | 'blossom' | 'starlight' | 'aurora' | 'botanical' | 'dunes' | 'pearl' | 'noir' | 'silk';
export type WallpaperCollection = 'classic' | 'cute' | 'studio';

export const wallpapers: {
  id: WallpaperId;
  name: string;
  caption: string;
  light: [string, string];
  dark: [string, string];
  ink: string;
  collection: WallpaperCollection;
}[] = [
  {
    id: 'none',
    collection: 'classic',
    name: 'Classic',
    caption: 'A clean little canvas',
    light: ['#F8FAFC', '#F8FAFC'],
    dark: ['#0F172A', '#0F172A'],
    ink: '#94A3B8',
  },
  {
    id: 'clouds',
    collection: 'cute',
    name: 'Cloud Nine',
    caption: 'Soft skies, happy days',
    light: ['#EAF5FF', '#F3EFFF'],
    dark: ['#15263C', '#231E38'],
    ink: '#9BBFE7',
  },
  {
    id: 'blossom',
    collection: 'cute',
    name: 'Peach Blossom',
    caption: 'A pocket full of petals',
    light: ['#FFF0EB', '#FFF6E5'],
    dark: ['#33242E', '#292536'],
    ink: '#DE91A6',
  },
  {
    id: 'starlight',
    collection: 'cute',
    name: 'Lavender Dreams',
    caption: 'A little everyday magic',
    light: ['#EEE9FF', '#F8EEFF'],
    dark: ['#211C38', '#14283F'],
    ink: '#AD98DF',
  },
  {
    id: 'aurora', collection: 'studio', name: 'Mint Aurora', caption: 'A soft northern glow',
    light: ['#E5F4EE', '#E9E8FA'], dark: ['#0F292B', '#24203D'], ink: '#74BCA7',
  },
  {
    id: 'botanical', collection: 'studio', name: 'Sage Garden', caption: 'Room to breathe',
    light: ['#EDF1E7', '#F6F2E9'], dark: ['#182822', '#252B24'], ink: '#8B9C78',
  },
  {
    id: 'dunes', collection: 'studio', name: 'Golden Dunes', caption: 'Warm, quiet horizons',
    light: ['#F9EFE2', '#F0DCC7'], dark: ['#29221F', '#3B2B27'], ink: '#C49E77',
  },
  {
    id: 'pearl', collection: 'studio', name: 'Ocean Pearl', caption: 'Calm in every curve',
    light: ['#EAF1F5', '#F4F2EE'], dark: ['#172735', '#252C36'], ink: '#83A4B8',
  },
  {
    id: 'noir', collection: 'studio', name: 'Champagne Atelier', caption: 'Fine lines, golden light',
    light: ['#F5F0E7', '#EAE3D6'], dark: ['#171A23', '#25232C'], ink: '#BAA078',
  },
  {
    id: 'silk', collection: 'studio', name: 'Rose Silk', caption: 'A softer kind of luxury',
    light: ['#F9EDEF', '#EFE8F3'], dark: ['#30222F', '#26223A'], ink: '#CDA0B2',
  },
];

export const getWallpaper = (id: WallpaperId) =>
  wallpapers.find(item => item.id === id) ?? wallpapers[0];
