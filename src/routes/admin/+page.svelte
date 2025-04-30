<script lang="ts">
    import {goto} from '$app/navigation';
    import StatusBadge from '$lib/StatusBadge.svelte';
    import {type ResultStatus, type StudentInfo} from '$lib/setting';
    import {fetchAllUsersData} from '$lib/database';

    let day = $state("01");
    let allUsersData: StudentInfo[] = $state([]);
    let tableHead: string[] = $state([]);
    let matrix:  { [taskKey:string]: ResultStatus } [] = $state([]);

    async function confirmStatus() {
        allUsersData = await fetchAllUsersData();
        matrix = [];
        for(let idx= 0; idx < allUsersData.length; idx++){
            const data = allUsersData[idx];
            matrix[idx] = {};
            for(const [taskKey, {status}] of Object.entries(data.best)) {
                matrix[idx][taskKey] = status;
            }
        }
        tableHead = [];
        for(const data of allUsersData) {
            for(const taskKey of Object.keys(data.best)) {
                if(!tableHead.includes(taskKey)) {
                    tableHead.push(taskKey);
                }
            }
        }
    }
    confirmStatus();
</script>
<div class="flex flex-row gap-8 p-4">
    <button class="button" onclick={() => goto('/dashboard')}>dashboard</button>
    <button class="button" onclick={confirmStatus}>成績更新</button>
    <div class="w-36"></div>
    <button class="button" onclick={() => goto('/admin/registerTask')}>課題設定</button>
    <button class="button" onclick={() => goto('/admin/registerUser')}>ユーザ登録</button>
</div>



<table class="score-table">
    <thead>
        <tr>
            <th class="w-[3rem]">番号</th>
            <th class="w-[8rem]">名前</th>
            {#each tableHead as taskKey}
                <th class="w-[5rem]">{taskKey}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each matrix as row, index}
        {@const user = allUsersData[index]}
            <tr>
                <td>{user.studentID}</td>
                <td>{user.displayName}</td>
                {#each tableHead as taskKey}
                    <td><StatusBadge status={row[taskKey]} /></td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>