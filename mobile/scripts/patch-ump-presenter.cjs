const { readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const file = join(
  __dirname,
  "../node_modules/react-native-google-mobile-ads/ios/RNGoogleMobileAds/RNGoogleMobileAdsConsentModule.mm",
);
const source = readFileSync(file, "utf8");
const original = /  \[UMPConsentForm\s+presentPrivacyOptionsFormFromViewController:RCTPresentedViewController\(\)\s+completionHandler:(\^\(NSError \*_Nullable formError\) \{[\s\S]*?\})\];/;
const marker = "Masterland: let UMP resolve the visible main-window presenter.";
if (source.includes(marker)) process.exit(0);
if (!original.test(source)) {
  throw new Error("Google Mobile Ads changed its iOS privacy presenter. Review this patch.");
}
const patched = source.replace(original, (_, completion) => {
  return `  // ${marker}
  dispatch_async(dispatch_get_main_queue(), ^{
    [UMPConsentForm presentPrivacyOptionsFormFromViewController:nil
                                              completionHandler:${completion}];
  });`;
});
writeFileSync(file, patched);
