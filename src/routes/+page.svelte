<script lang="ts">
    import {goto} from '$app/navigation';
    import {currentStudent} from '$lib/state.svelte';
    import {signIn, fetchMyBestResults} from '$lib/database';
    const emailpostfix = "@kenryo.ed.jp";
    let account:string = $state("");
    let password:string = $state("");

    async function login(){
        const email = account + emailpostfix;
        //ログイン処理
        await signIn(email, password);
        if(currentStudent.uid == ""){
            alert("ログインに失敗しました。\nアカウントが登録されていないか、パスワードが違います。");
        }
        else if(currentStudent.isAdmin){
            await fetchMyBestResults();
            goto("/admin");
        }
        else {
            await fetchMyBestResults();
            goto("/dashboard");
        }
    }
</script>

<div class="flex flex-col items-center mt-20 gap-8">
    <h1 class="text-4xl font-bold">縣陵プログラミング講座2025</h1>
    <p class="text-3xl font-bold mb-4">ジャッジシステム</p>
    <div class="flex flex-col gap-4">
        <label>アカウント:
            <input type="text" bind:value={account} class="border w-[10rem] p-1 rounded" /> @kenryo.ed.jp
        </label>
        <label>
            パスワード:
            <input type="password" bind:value={password} class="border w-[10rem] p-1 rounded"/>
        </label>
    </div>
    <button class="button" onclick={login}>ログイン</button>
</div>
