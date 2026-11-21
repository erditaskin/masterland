const { expo } = require("./app.json");
module.exports = () => {
  const iosClient = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const plugins = [...(expo.plugins || []), "expo-apple-authentication"];
  if (
    iosClient &&
    /^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/.test(iosClient)
  )
    plugins.push([
      "@react-native-google-signin/google-signin",
      { iosUrlScheme: iosClient.split(".").reverse().join(".") },
    ]);
  const appId = process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID;
  const androidAppId = process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID;
  plugins.push([
    "react-native-google-mobile-ads",
    {
      // The sample ID keeps future Android QA builds bootable until its AdMob app is configured.
      androidAppId: /^ca-app-pub-\d+~\d+$/.test(androidAppId || "")
        ? androidAppId
        : "ca-app-pub-3940256099942544~3347511713",
      iosAppId: /^ca-app-pub-\d+~\d+$/.test(appId || "")
        ? appId
        : "ca-app-pub-3940256099942544~1458002511",
      delayAppMeasurementInit: true,
    },
  ]);
  return { ...expo, ios: { ...expo.ios, usesAppleSignIn: true }, plugins };
};
