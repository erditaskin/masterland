const { expo } = require("./app.json");
module.exports = () => {
  const iosClient = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const plugins = [...(expo.plugins || []), "expo-apple-authentication"];
  if (iosClient && /^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/.test(iosClient))
    plugins.push(["@react-native-google-signin/google-signin", { iosUrlScheme: iosClient.split(".").reverse().join(".") }]);
  return { ...expo, ios: { ...expo.ios, usesAppleSignIn: true }, plugins };
};
