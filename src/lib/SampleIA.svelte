<script lang="ts">
    import Icon from "@iconify/svelte";
    const {text}:{text:string[]} = $props();
    const textString = text.join('\n');
    let checkIcon = $state(false);

    function copy(){
        navigator.clipboard.writeText(textString);
        checkIcon = true;
        setTimeout(() => {checkIcon = false;}, 500);
    }
</script>

<div class="my-1 bg-iabox p-2 rounded-md relative">
    <div class="overflow-x-auto font-mono whitespace-pre-line">{textString}</div>
    <button onclick={copy} 
        class="absolute top-1 right-1 p-1 rounded 
        bg-iabox text-onSurface hover:bg-surfaceVariant hover:bg-surface">
        <Icon icon={checkIcon ? "mdi:check" : "mdi:content-copy"}/>
    </button>
</div>