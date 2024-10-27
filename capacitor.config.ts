import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'UseYourFridge',
  webDir: 'www',
  server: {
    url: 'http://192.168.178.53:8100', // Remplacez par votre nouvelle IP
    cleartext: true
  }

};

export default config;
