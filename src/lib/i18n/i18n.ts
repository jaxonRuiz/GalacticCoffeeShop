import { addMessages, init, getLocaleFromNavigator, locale } from 'svelte-i18n';

// import translation packs 
import en from './en.json';
import zh from './zh.json';
import { get, type Writable, writable } from 'svelte/store';

// add translations to app
addMessages('en', en);
addMessages('zh', zh);

// initialize i18n and language
init({
	fallbackLocale: 'en',
	initialLocale: getLocaleFromNavigator(),
});

export const locName: { [key: string]: string } = {
	en: 'English',
	zh: '简体中文',
};

export let currLoc: Writable<string> = writable(
	(getLocaleFromNavigator() ?? 'en') in locName ?
		getLocaleFromNavigator()!
		:
		'en'
);

export function cycleLanguage() {
	const all = Object.keys(locName);
	let ind = all.indexOf(get(currLoc));
	ind = (ind + 1) % all.length;
	setLanguage(all[ind]);
	currLoc.set(all[ind]);
}

export function setLanguage(loc: string) {
	locale.set(loc);
}
