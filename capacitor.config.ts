import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.useyourfridge.app',
  appName: 'UseYourFridge',
  webDir: 'www',
  server: {
    hostname: '192.168.1.94:8100',
    cleartext: true,
    androidScheme:"http"
  }

};

export default config;
