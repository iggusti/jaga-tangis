import { registerRootComponent } from 'expo';
import App from './App';
import { defineBackgroundTask } from './src/services/BackgroundTask';

defineBackgroundTask(async () => false);
registerRootComponent(App);
