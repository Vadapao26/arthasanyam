/**
 * Capacitor Configuration for अर्थसंयम (Arthasanyam)
 * Architecture: 100% Offline-First, Local-Storage Only
 */
const config = {
  appId: 'in.maharashtra.arthasanyam.offline',
  appName: 'अर्थसंयम (Arthasanyam)',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_warli_gavli',
      iconColor: '#9E3B24',
    },
  },
};

export default config;
