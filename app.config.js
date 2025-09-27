const IS_DEV = process.env.NODE_ENV === 'development';

export default {
  expo: {
    name: "PlantParent",
    slug: "PlantParentClean",
    ...(IS_DEV && { sdkVersion: "54.0.0" }), // Only for local development
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.denudey.plantparent",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you add plant pictures."
        }
      ],
      [ "expo-localization"],
      [
        "@sentry/react-native/expo",
        {
          "url": "https://sentry.io/",
          "project": "plantparent",
          "organization": "trakiro"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "3148cd4f-80f1-438a-9b18-51f12e383db8"
      }
    }
  }
};