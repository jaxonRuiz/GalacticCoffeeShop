import { writable, type Writable } from "svelte/store";

export let optionsWindowOpen: Writable<boolean> = writable(false);