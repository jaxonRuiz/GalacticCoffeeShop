import { get, type Writable, writable } from "svelte/store";

export let tooltips: Writable<Tooltip[]> = writable([]);
let tooltipId: number = 0;
let scrollPos: number = 0;

export const tooltipStyle: string = `
		--bg: #000;
		--s: 1rem;
		--b: 2.5rem;
`;

export function newToolTip(
	text: string[],
	type: "top" | "bot" | "right" | "left",
): number {
	const id = tooltipGetID();
	tooltips.update((tooltip) => {
		tooltip.push({
			id: id,
			visible: false,
			x: 0,
			y: 0,
			type,
			text,
		});
		return tooltip;
	});
	return id;
}

export function removeToolTip(id: number) {
	tooltips.update((tooltip) => {
		return tooltip.filter((t) => t.id !== id);
	});
}

export function toggleTooltip(id: number) {
	tooltips.update((tooltip) => {
		const t = tooltip.find((t) => t.id === id);
		if (t) {
			t.visible = !t.visible;
		}
		return tooltip;
	});
}

export function onScroll(event: Event) {
	// update values for visible tooltips
	const delta = (event.target as HTMLElement).scrollTop - scrollPos;
	scrollPos = (event.target as HTMLElement).scrollTop;
	tooltips.update((tooltip) => {
		tooltip.forEach((t) => {
			if (t.visible) {
				t.y -= delta;
			}
		});
		return tooltip;
	});
}

export function updateTooltip(id: number, box: DOMRect) {
	tooltips.update((tooltip) => {
		const t = tooltip.find((t) => t.id === id);
		if (t) {
			const pos = types[t.type](box);
			t.x = pos.x;
			t.y = pos.y;
		}
		return tooltip;
	});
}

function tooltipGetID() {
	return tooltipId++;
}

const buffer: number = 0;
const types: { [key: string]: CallableFunction } = {
	top: (box: DOMRect) => {
		return {
			x: box.x + box.width / 2,
			y: box.y - buffer,
		};
	},
	bot: (box: DOMRect) => {
		return {
			x: box.x + box.width / 2,
			y: box.y + box.height + buffer,
		};
	},
	left: (box: DOMRect) => {
		return {
			x: box.x - buffer,
			y: box.y + box.height / 2,
		};
	},
	right: (box: DOMRect) => {
		return {
			x: box.x + box.width + buffer,
			y: box.y + box.height / 2,
		};
	},
};

interface Tooltip {
	id: number;
	visible: boolean;
	x: number;
	y: number;
	type: "top" | "bot" | "left" | "right";
	text: string[];
}
