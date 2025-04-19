import { get, writable, type Writable } from "svelte/store";

// does not work
// export function arrayProxy<T>(arr: Writable<T[]>): T[] {
// 	return new Proxy(get(arr), {
// 		get(target, prop) {
// 			if (prop === 'length') {
// 				return target.length;
// 			}
// 			const index = Number(prop);
// 			if (!isNaN(index) && index >= 0 && index < target.length) {
// 				return target[index];
// 			}
// 			if (typeof target[prop as keyof T[]] === 'function') {
// 				return (target[prop as keyof T[]] as any).bind(target);
// 			}
// 			return undefined;
// 		},
// 		set(target, prop, value) {
// 			const index = Number(prop);
// 			if (!isNaN(index) && index >= 0) {
// 				target[index] = value as T;
// 				arr.update((_) => [...target]);
// 				return true;
// 			}
// 			return false;
// 		},
// 	});
// }

export function dictProxy<T>(dictionary: Writable<{ [key: string]: T }>): { [key: string]: T } {
	return new Proxy(get(dictionary), {
		get(target, prop) {
			if (prop in target) {
				return target[prop as keyof typeof target];
			}
			return undefined;
		},
		set(target, prop, value) {
			target[prop as keyof typeof target] = value as T;
			dictionary.set(target);
			return true;
		},
	});
}

export class Sample {
	w_dictionary: Writable<{ [key: string]: any }> = writable({
		"key1": 1,
		"key2": 2,
		"key3": 3,
	});

	get dictionary() {
		return dictProxy(this.w_dictionary);
	}
	constructor() {
	}

	updateDictionary(key: string) {
		this.dictionary[key] = (this.dictionary[key] || 0) + 1;
	}
}
