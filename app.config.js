export default {
  expo: {
    name: "PlantParent",
    slug: "PlantParent",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.denudey.plantparent", // ADD THIS - change yourname
      versionCode: 1, // ADD THIS
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: [ // ADD THIS
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [ // ADD THIS
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you add plant pictures."
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