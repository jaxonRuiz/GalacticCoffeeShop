<script>
    import { t } from "svelte-i18n";
    import Button from "./Button.svelte";
    import { cycleLanguage, locName, currLoc } from "../i18n/i18n";
    import { globalVolumeScale, musicVolume, sfxVolume } from "../backend/systems/audioManager";
    import { fPercent } from "./Styles.svelte";
</script>

<main class="col">
    <h1>{$t("options_title")}</h1>
    <div class="row item">
        <p>{$t("opt_lang")}</p>
        <Button
            move={false}
            onclick={() => {
                cycleLanguage();
            }}
        >
            <p>{locName[$currLoc]}</p>
        </Button>
    </div>

    <!-- Master Volume Slider -->
    <div class="row item">
        <p>{$t("opt_master_volume")}</p>
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            bind:value={$globalVolumeScale}
        />
        <span>{fPercent(Math.round($globalVolumeScale * 100))}</span>
    </div>

    <!-- Music Volume Slider -->
    <div class="row item">
        <p>{$t("opt_music_volume")}</p>
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            bind:value={$musicVolume}
        />
        <span>{fPercent(Math.round($musicVolume * 100))}</span>
    </div>

    <!-- SFX Volume Slider -->
    <div class="row item">
        <p>{$t("opt_sfx_volume")}</p>
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            bind:value={$sfxVolume}
        />
        <span>{fPercent(Math.round($sfxVolume) * 100)}</span>
    </div>
</main>

<style>
    main {
        margin-bottom: 2rem;
    }

    h1 {
        text-align: center;
    }

    div.item {
        align-items: center;
        justify-content: space-between;
        &> *:first-child {
            margin-right: 2rem;
        }
    }
</style>
