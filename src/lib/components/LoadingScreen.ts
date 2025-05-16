import { writable, type Writable } from "svelte/store";

export let loading: Writable<boolean> = writable(false);

export function loadingScreen() {
	loading.set(true);
}

export function loadedObject() {
	loading.set(false);
}
