<script lang="ts">
    import {page} from '$app/state';
    import CodeMirror from 'svelte-codemirror-editor';
    import StatusBadge from '$lib/StatusBadge.svelte';
    import {reduceStatus} from '$lib/setting';
    import type {MyResult, ResultStatus, TaskData} from '$lib/setting';
    import {currentStudent, myBest} from '$lib/state.svelte';
    import {postResult, fetchMyResults, getTaskKey, postMyBestResult, fetchMyBestResults} from '$lib/database';
    const {data} = $props();
    const {taskdata, day, task}:{taskdata:TaskData, day:string, task:string} = data;
    const taskKey = getTaskKey(day, task);
</script>

