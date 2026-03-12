import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.guru.dashboard',
  appName: 'Guru Dashboard',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
