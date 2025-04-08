<script>
	import { t } from "svelte-i18n";
	import Button from "../components/Button.svelte";
	import { setLanguage } from "../../i18n/i18n";
	import { globalVolumeScale } from "../../backend/systems/audioManager";

	let locale = "en";
</script>

<main class="col">
	<h1>{$t("options_title")}</h1>
	<div class="row item">
		<p>{$t("opt_lang")}</p>
		<Button
			move={false}
			onclick={() => {
				locale = locale == "en" ? "zh" : "en";
				setLanguage(locale);
			}}
		>
			<p>{$t("opt_lang_" + locale)}</p>
		</Button>
	</div>

	<div class="row item">
		<p>{$t("opt_volume")}</p>
		<input
			type="range"
			min="0"
			max="1"
			step="0.01"
			bind:value={$globalVolumeScale}
		/>
		<span>{Math.round($globalVolumeScale * 100)}%</span>
	</div>
</main>

<style>
	main {
		margin-bottom: 2rem;
	}

	div.item {
		align-items: center;
		&> *:first-child {
			margin-right: 2rem;
		}
	}
</style>
