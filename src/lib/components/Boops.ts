import { get, type Writable, writable } from "svelte/store";

export let boops: Writable<Boop[]> = writable([]);
const maxBoopDuration = 1000;

export function booped(x: number, y: number, type: string, num?: string) {
	num = num || "";
	boops.set([...get(boops), { x, y, type, id: Date.now() + Math.random(), num }]);
	console.log(get(boops), get(boops).length);

	setTimeout(() => {
		boops.update((boops) => {
			boops.shift();
			return boops;
		});
	}, maxBoopDuration);
}

interface Boop {
	x: number;
	y: number;
	type: string;
	num?: string;
	id: number;
}
