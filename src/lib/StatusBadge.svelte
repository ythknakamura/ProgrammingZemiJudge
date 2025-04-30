<script lang="ts">
    import type {ResultStatus} from '$lib/setting';
    const {status}:{status:ResultStatus} = $props();
</script>

<span class="text-surface text-xs px-2 py-1 rounded-md cursor-default"
    class:bg-green-400={status == "AC"}
    class:bg-orange-400={status == "WA"}
    class:bg-yellow-400={status == "TLE"}
    class:bg-red-400={status == "RE"}
    class:bg-gray-400={status == "WJ"}>
    {status}
</span>