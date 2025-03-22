import { addMessages, init, getLocaleFromNavigator, locale } from 'svelte-i18n';

// import translation packs 
import en from './en.json';
import zh from './zh.json';

// add translations to app
addMessages('en', en);
addMessages('zh', zh);

// initialize i18n and language
init({
	fallbackLocale: 'en',
	initialLocale: getLocaleFromNavigator(),
});

const locName = {
	en: 'English',
	zh: '简体中文',
};

export function setLanguage(loc: string) {
	locale.set(loc);
}
