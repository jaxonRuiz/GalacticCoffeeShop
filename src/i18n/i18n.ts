import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';

// import translation packs 
import en from './en.json';
// import zh from './zh.json';

// add translations to app
addMessages('en', en);
// addMessages('zh', zh);

// initialize i18n and language
init({
	fallbackLocale: 'en',
	initialLocale: getLocaleFromNavigator(),
});
