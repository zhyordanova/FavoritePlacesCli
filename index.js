/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// App Center is initialized automatically via native config files:
// iOS: AppCenter-Config.plist, Android: res/values/strings.xml

AppRegistry.registerComponent(appName, () => App);
