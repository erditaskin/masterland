const { withXcodeProject } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");
/** Keep generated native projects disposable; test wiring is reproduced by Expo prebuild. */
module.exports = function withUITests(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults,
      objects = project.hash.project.objects;
    const app = project.getFirstTarget(),
      name = config.modRequest.projectName;
    const testName = "MasterlandUITests";
    let target = Object.entries(project.pbxNativeTargetSection()).find(
      ([id, t]) =>
        !id.endsWith("_comment") &&
        String(t.name).replaceAll('"', "") === testName,
    );
    let uuid;
    if (target) uuid = target[0];
    else {
      objects.PBXTargetDependency ??= {};
      objects.PBXContainerItemProxy ??= {};
      const created = project.addTarget(
        testName,
        "unit_test_bundle",
        testName,
        "com.erditaskin.masterland.uitests",
      );
      uuid = created.uuid;
      created.pbxNativeTarget.productType =
        '"com.apple.product-type.bundle.ui-testing"';
      // node-xcode assumes extensions depend from the app; UI tests depend on the app instead.
      app.firstTarget.dependencies = (
        app.firstTarget.dependencies || []
      ).filter((ref) => {
        const dep = objects.PBXTargetDependency[ref.value];
        if (dep?.target !== uuid) return true;
        const proxy = dep.targetProxy;
        delete objects.PBXTargetDependency[ref.value];
        delete objects.PBXTargetDependency[ref.value + "_comment"];
        delete objects.PBXContainerItemProxy[proxy];
        delete objects.PBXContainerItemProxy[proxy + "_comment"];
        return false;
      });
      project.addTargetDependency(uuid, [app.uuid]);
      project.addBuildPhase([], "PBXSourcesBuildPhase", "Sources", uuid);
      project.addBuildPhase([], "PBXFrameworksBuildPhase", "Frameworks", uuid);
      project.addSourceFile(
        "../qa/MasterlandTests.swift",
        { target: uuid },
        project.getFirstProject().firstProject.mainGroup,
      );
      const list =
        project.pbxXCConfigurationList()[
          created.pbxNativeTarget.buildConfigurationList
        ];
      for (const ref of list.buildConfigurations) {
        const settings =
          project.pbxXCBuildConfigurationSection()[ref.value].buildSettings;
        delete settings.INFOPLIST_FILE;
        Object.assign(settings, {
          GENERATE_INFOPLIST_FILE: "YES",
          SWIFT_VERSION: "5.0",
          IPHONEOS_DEPLOYMENT_TARGET: "17.0",
          SDKROOT: "iphoneos",
          TEST_TARGET_NAME: '"' + name + '"',
          TARGETED_DEVICE_FAMILY: "1",
          CODE_SIGN_STYLE: "Automatic",
        });
      }
    }
    const reference = (id, buildName, blueprint) =>
      `<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${id}" BuildableName="${buildName}" BlueprintName="${blueprint}" ReferencedContainer="container:${name}.xcodeproj"/>`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Scheme LastUpgradeVersion="1600" version="1.3"><BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="YES">${reference(app.uuid, name + ".app", name)}</BuildActionEntry><BuildActionEntry buildForTesting="YES" buildForRunning="NO" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="YES">${reference(uuid, testName + ".xctest", testName)}</BuildActionEntry></BuildActionEntries></BuildAction><TestAction buildConfiguration="Release" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.PosixSpawn" shouldUseLaunchSchemeArgsEnv="YES"><Testables><TestableReference skipped="NO">${reference(uuid, testName + ".xctest", testName)}</TestableReference></Testables></TestAction><LaunchAction buildConfiguration="Release" selectedDebuggerIdentifier="" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.PosixSpawn"><BuildableProductRunnable runnableDebuggingMode="0">${reference(app.uuid, name + ".app", name)}</BuildableProductRunnable></LaunchAction></Scheme>`;
    const dir = path.join(
      config.modRequest.platformProjectRoot,
      name + ".xcodeproj/xcshareddata/xcschemes",
    );
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "MasterlandQA.xcscheme"), xml);
    return config;
  });
};
