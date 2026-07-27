# Unity Earning Android App Build Instructions

This folder contains the source code for the Android wrapper of the Unity Earning Dashboard. It uses a WebView to load the live website as a standalone application.

## Prerequisites
1. [Android Studio](https://developer.android.com/studio) (Electric Eel or newer recommended)
2. JDK 11 or higher

## Build Steps
1. Open Android Studio.
2. Select **File > Open** and choose the `android-wrapper` folder.
3. Wait for the Gradle sync to complete.
4. To build the APK:
   - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Once finished, a notification will appear with a "Locate" link to the APK file.
5. To build a Signed Release APK:
   - Go to **Build > Generate Signed Bundle / APK**.
   - Follow the instructions to create/use a keystore.
   - The resulting `app-release.apk` should be placed in the `/public` folder of your web project to make it downloadable via the "Download App" button.

## Customization
- **App Icon**: Replace the placeholder icons in `app/src/main/res/mipmap-*` with your actual icons.
- **URL**: If you move your website to a custom domain, update the URL in `MainActivity.kt`.

## Features
- Full-screen WebView.
- Local Storage & Hardware Acceleration enabled.
- Back button handling (navigation within the app).
- No browser address bar for a native look.
