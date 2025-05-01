<script lang="ts">
	import Button from "../Button.svelte";

    let { task, franchise, i } = $props()

    let res = franchise.w_researchers;
	let taskRes = franchise.researchLab.w_currentTaskList;
</script>

<div class="upgrade-card">
    <p style="font-size: 1.3rem;">{task.desc}</p>
    <p>Estimated time left: {Math.floor(task.researchUnits / (task.researchersAllocated * franchise.researchLab.researcherSpeed * 4))}</p>
    <p>Researchers working: {task.researchersAllocated}</p>
    <p>Reward: {task.sciencePoints}</p>
    <Button onclick={() => franchise.researchLab.allocateResearchers(1, i)}
        disabled={$res < 1}
        style = "
            background-color: {$res < 1 ? '#444' : '#515151'};
            cursor: {$res < 1 ? '--cno' : '--cpointer'};
        ">
        Allocate 1 researcher
    </Button>
    <Button onclick={() => franchise.researchLab.allocateResearchers(10, i)}
        disabled={$res < 10}
        style = "
            background-color: {$res < 10 ? '#444' : '#515151'};
            cursor: {$res < 10 ? '--cno' : '--cpointer'};
        ">
        Allocate 10 researcher
    </Button>
    <br>
    <br>
    <Button onclick={() => franchise.researchLab.deallocateResearchers(1, i)}
        disabled={$taskRes[i].researchersAllocated < 1}
        style = "
            background-color: {$taskRes[i].researchersAllocated < 1 ? '#444' : '#515151'};
            cursor: {$taskRes[i].researchersAllocated < 1 ? '--cno' : '--cpointer'};
        ">
        Deallocate 1 researcher
    </Button>
    <Button onclick={() => franchise.researchLab.deallocateResearchers(10, i)}
        disabled={$taskRes[i].researchersAllocated < 10}
        style = "
            background-color: {$taskRes[i].researchersAllocated < 10 ? '#444' : '#515151'};
            cursor: {$taskRes[i].researchersAllocated < 10 ? '--cno' : '--cpointer'};
        ">
        Deallocate 10 researcher
    </Button>
</div>