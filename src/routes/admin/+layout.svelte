<script lang="ts">
    import {goto} from '$app/navigation';
    import {currentStudent} from '$lib/state.svelte';
    const {children} = $props();

    if(currentStudent.uid === "") {
        alert("ログインしてください");
        goto("/");
    }
    else if(!currentStudent.isAdmin) {
        alert("管理者権限がありません");
        goto("/");
    }
    else{
        //const a = 
        //よみこみ
    }

</script>

<h1 class="bg-red-300">管理用ページ</h1>
<div>
    {@render children()}
</div>