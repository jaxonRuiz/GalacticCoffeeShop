import { getLocaleFromNavigator } from "svelte-i18n";
import { img } from "../../assets/img";

export const pointerStyle = `
	--cdefault: url("${img.cursor_default}") 10 5;
	--cpointer: url("${img.cursor_pointer}") 8 4;
	--cno: url("${img.cursor_no}") 10 6;
	--cwait: url("${img.cursor_wait}") 15 6;
`;

const currencySymbol: { [key: string]: string } = {
	"en": "$",
};

export function fSellableCoffee(num: number) {
	return num;
}

export function fMoney(num: number) {
	return (num < 0 ? "-" : "") +
		(currencySymbol[getLocaleFromNavigator() ?? "en"] ?? "$") +
		Math.abs(num).toFixed(2);
}

export function fAppeal(num: number) {
	return (100 * num).toFixed(2) + "%";
}

export function fPercent(num: number) {
	return num + "%";
}
