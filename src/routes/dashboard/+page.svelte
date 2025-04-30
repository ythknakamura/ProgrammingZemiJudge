<script lang="ts">
    import {Collapsible} from 'melt/builders';
    import {allTaskHeadPromise} from '$lib/database';
    import {currentStudent} from '$lib/state.svelte';
    import { goto } from '$app/navigation';
    import {myBest} from '$lib/state.svelte';
    import {getTaskKey} from '$lib/database';
    import StatusBadge from '$lib/StatusBadge.svelte';

    const collapsibleDay:Collapsible[] = [];

    if(currentStudent.uid === "") {
        alert("ログインしてください");
        goto("/");
    }
    allTaskHeadPromise.then((allTaskHead) => {
        Object.keys(allTaskHead).forEach((daystr) => {
            collapsibleDay.push(new Collapsible());
            collapsibleDay[collapsibleDay.length-1].open = true;
        });
        collapsibleDay[collapsibleDay.length-1].open = true;
    });
</script>

{#await allTaskHeadPromise then allTaskHead}
<dvi class="flex flex-col-reverse mt-4 gap-6">
    {#each Object.entries(allTaskHead) as [daystr, taskHeads], idx}
        {@const colla = collapsibleDay[idx]}
        <div>
            <div {...colla.trigger} >
                <button 
                    class="button text-lg px-4 py-2 w-[10rem]">
                    {daystr}
                </button>
            </div>
            {#if colla.open}
                <div {...colla.content} class="bg-iabox/50 rounded-sm ms-10">
                    {#each taskHeads as taskHead}
                        {@const taskKey = getTaskKey(taskHead.day, taskHead.task)}
                        {@const best = myBest[taskKey]}
                        <a  href={`../tasks/${taskHead.day}/${taskHead.task}`}
                            class="grid grid-cols-[5rem_auto_5rem_10rem] my-2 py-2 ms-2
                            cursor-pointer text-center hover:bg-container rounded-xl">
                            <div class="font-bold">{taskHead.task}</div>
                            <div class="text-left">{taskHead.title}</div>
                            {#if best}
                                <div>
                                    <StatusBadge status={best.status} />
                                </div>
                                <div>{best.dateStr}</div>
                            {/if}
                        </a>
                    {/each}
                </div>
            {/if}
        </div>
    {/each}
</dvi>
{/await}
