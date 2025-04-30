<script lang="ts">
import {onMount } from 'svelte';
    import SampleIA from '$lib/SampleIA.svelte';
    import type{TaskData} from '$lib/setting';
    const {taskdata}:{taskdata:TaskData} = $props();
    onMount(()=>MathJax.typeset([".mathjax"]));
</script>

<h3>問題文</h3>
<div>
    {#each taskdata.statements as statement}
        <p class="mathjax">{statement}</p>
    {/each}
</div>

{#if taskdata.constraints.length>0 }
    <h3 class="mt-4">制約条件</h3>
    <div>
        <ul>
        {#each taskdata.constraints as constraint}
            <li class="mathjax">{constraint}</li>
        {/each}
        </ul>
    </div>
    <hr/>
{/if}

<h4>入力形式</h4>
<div class="mathjax">
    {#if taskdata.inputFormat.length > 0}
        <SampleIA text={taskdata.inputFormat}/>
    {:else}
        <p>なし</p>
    {/if}
</div>

<h4>出力形式</h4>
<div>
    <p class="mathjax">{taskdata.outputFormat}</p>
</div>

{#each taskdata.sampleIA as ia,i}
    <hr/>

    <h4>入力例{i+1}</h4>
    <div>
        {#if ia.input.length > 0}
            <SampleIA text={ia.input}/>
        {:else}
            <p>なし</p>
        {/if}
    </div>

    <h4>出力例{i+1}</h4>
    <div>
        <SampleIA text={ia.answer}/>
    </div>
    <p class="mathjax">{ia.description}</p>
{/each}