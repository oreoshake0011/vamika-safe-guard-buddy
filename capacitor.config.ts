import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vamika.app', // optional: make this cleaner & valid for Android
  appName: 'vamika-safe-guard-buddy',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#8A56AC",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#FFFFFF",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
