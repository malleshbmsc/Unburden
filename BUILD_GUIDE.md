# APK Build Troubleshooting Guide

## Common EAS Build Issues and Solutions

### 1. Authentication Issues
If `eas login` is not working:
```bash
# Clear EAS credentials
eas logout
eas login

# Or use token-based authentication
eas login --token YOUR_TOKEN
```

### 2. Project Configuration Issues
Make sure your project is properly configured:

```bash
# Initialize EAS in your project
eas build:configure

# Check your eas.json configuration
cat eas.json
```

### 3. Environment Variables
Ensure your environment variables are properly set for EAS:

```bash
# Set environment variables for EAS
eas secret:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value "your_api_key_here"
```

## Alternative Solution: Local APK Build

Since EAS might not be working, here's how to build locally:

### Prerequisites
1. Install Android Studio
2. Set up Android SDK
3. Configure environment variables

### Step-by-Step Local Build

1. **Prebuild the project:**
```bash
npx expo prebuild --platform android --clear
```

2. **Navigate to android directory:**
```bash
cd android
```

3. **Build debug APK:**
```bash
./gradlew assembleDebug
```

4. **Build release APK (for production):**
```bash
./gradlew assembleRelease
```

The APK will be located at:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

## Quick Test Build (Development)

For testing purposes, you can create a development build:

```bash
# Install Expo Dev Client
npx expo install expo-dev-client

# Create development build
npx expo run:android
```

## Troubleshooting Common Errors

### Error: "Android SDK not found"
```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Error: "Gradle build failed"
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

### Error: "Metro bundler issues"
```bash
# Clear Metro cache
npx expo start --clear
```

## Production Build Checklist

Before building for production:

- [ ] Update version in `app.json`
- [ ] Configure app signing
- [ ] Set up environment variables
- [ ] Test on physical device
- [ ] Optimize bundle size
- [ ] Configure Proguard (optional)

## App Signing for Release

For release builds, you'll need to sign your APK:

1. **Generate keystore:**
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure signing in `android/app/build.gradle`:**
```gradle
android {
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'your-store-password'
            keyAlias 'my-key-alias'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## Testing Your APK

1. **Install on device:**
```bash
adb install app-debug.apk
```

2. **Check logs:**
```bash
adb logcat
```

## Next Steps

1. Try the local build approach first
2. If you need EAS Build, check your Expo account status
3. Consider using GitHub Actions for automated builds
4. For production, set up proper CI/CD pipeline

## Need Help?

If you're still having issues:
1. Check Expo documentation: https://docs.expo.dev/build/setup/
2. Join Expo Discord for community support
3. Check your project's specific error logs