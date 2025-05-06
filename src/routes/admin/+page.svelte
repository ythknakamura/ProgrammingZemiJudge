<script lang="ts">
    import {goto} from '$app/navigation';
    import StatusBadge from '$lib/StatusBadge.svelte';
    import {type ResultStatus, type StudentInfo} from '$lib/setting';
    import {fetchAllUsersData, allTaskHeadPromise, getTaskKey} from '$lib/database';

    let daystr = $state("day04");
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
        const allTaskHead = await allTaskHeadPromise;
        tableHead = [];
        for(const taskKey of allTaskHead[daystr]) {
            tableHead.push(getTaskKey(taskKey.day, taskKey.task));
        }
    }
    confirmStatus();
</script>
<div class="flex flex-row gap-8 p-4">
    <button class="button" onclick={() => goto('/dashboard')}>dashboard</button>
    <button class="button" onclick={confirmStatus}>成績更新</button>
    <label>日にち
        <input type="text" bind:value={daystr} class="border w-18 px-1"/>
    </label>
    <div class="w-18"></div>
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