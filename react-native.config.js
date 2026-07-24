module.exports = {
  dependencies: {
    appcenter: {
      platforms: {
        android: {
          packageInstance: 'new AppCenterReactNativePackage(getApplication())',
        },
      },
    },
    'appcenter-analytics': {
      platforms: {
        android: {
          packageInstance:
            'new AppCenterReactNativeAnalyticsPackage(getApplication(), true)',
        },
      },
    },
    'appcenter-crashes': {
      platforms: {
        android: {
          packageInstance:
            'new AppCenterReactNativeCrashesPackage(getApplication(), "ALWAYS_SEND")',
        },
      },
    },
  },
};
