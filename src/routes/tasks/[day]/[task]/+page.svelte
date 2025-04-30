<script lang="ts">
    import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
    import {page} from '$app/state';
    import CodeMirror from 'svelte-codemirror-editor';
    import {python} from '@codemirror/lang-python';
    import Icon from "@iconify/svelte";
    import {pythonRunner, type TestInput, type TestResult} from '$lib/pythonRunner';
    import TaskView from '$lib/TaskView.svelte';
    import StatusBadge from '$lib/StatusBadge.svelte';
    import {reduceStatus} from '$lib/setting';
    import type {MyResult, ResultStatus, TaskData} from '$lib/setting';
    import {currentStudent, myBest} from '$lib/state.svelte';
    import {postResult, fetchMyResults, getTaskKey, postMyBestResult, fetchMyBestResults} from '$lib/database';


    type JudgeInput = TestInput & {caseName:string};
    type JudgeResult = TestResult & {caseName:string};
    const timelimit = 2000;
    let debounnceTimer: NodeJS.Timeout;

    const {data} = $props();
    const {taskdata, day, task}:{taskdata:TaskData, day:string, task:string} = data;
    const taskKey = getTaskKey(day, task);

    let isIdle:boolean = $state(false);
    let code:string = $state("");
    let myResultsPromise: Promise<MyResult[]> = $state(Promise.resolve([]));
    let judgeResults:JudgeResult[] = $state([]);
    let finalResult:{status:ResultStatus, executionTime:number}|null = $state(null);

    if(currentStudent.uid === "") {
        alert("ログインしてください");
        goto("/");
    }
    else{
        myResultsPromise = fetchMyResults(day, task);
        pythonRunner.resetWorker().then(()=>{isIdle = true;});
    }

    function saveCode(url:URL,newCode:string){
        sessionStorage.setItem(url + ":code", newCode);
    }
    
    function restoreCode(){
        const savedCode = sessionStorage.getItem(page.url + ":code");
        if(savedCode && savedCode.length > 0){
            code = savedCode;
        }else{
            code = taskdata.placeholder;
        }
    }
    function codechanged(event:CustomEvent<string>){
        clearTimeout(debounnceTimer);
        const url = page.url;
        debounnceTimer = setTimeout(()=>saveCode(url, event.detail), 1000);
    }
    afterNavigate(() => restoreCode());
    beforeNavigate(() => {
        saveCode(page.url, code);
        pythonRunner.resetWorker();
    });

    async function runCode(){
        if(!isIdle) return;
        isIdle = false;
        finalResult = null;
        judgeResults = [];
        const judgeInputs:JudgeInput[] = [];
        for (let i=0; i<taskdata.sampleIA.length; i++) {
            judgeInputs.push({
                caseName: `サンプル ${(i+1)}`,
                timelimit,
                code,
                ...taskdata.sampleIA[i],
            });
        }
        for(let i=0; i<taskdata.testcaseIA.length; i++){
            judgeInputs.push({
                caseName: `テスト ${(i+1)}`,
                timelimit,
                code,
                ...taskdata.testcaseIA[i],
            });
        }
        for(const judgeInput of judgeInputs){
            judgeResults.push({
                caseName: judgeInput.caseName,
                status:"WJ",
                executionTime: -1,
                output:[],
            });
        }

        setTimeout(()=>{
            document.querySelector(".result-table")?.scrollIntoView({behavior:"smooth", block:"start"});
        },0);
        

        for(let i = 0; i < judgeInputs.length; i++){
            const result = await pythonRunner.testCodeAsync(judgeInputs[i]);
            judgeResults[i].status = result.status;
            judgeResults[i].executionTime = result.executionTime;
            judgeResults[i].output = result.output;
        }

        const status = reduceStatus(judgeResults.map((result) => result.status), false);
        const executionTime = Math.max(...judgeResults.map((result) => result.executionTime));
        finalResult = {status, executionTime};


        await postResult(day, task, code, status, executionTime);
        const newStatus =  reduceStatus([status, myBest[taskKey]?.status ?? "INIT"], true);
        if(newStatus !== myBest[taskKey]?.status){
            await postMyBestResult(taskKey, newStatus);
            await fetchMyBestResults();
        }
        myResultsPromise = fetchMyResults(day, task);
        isIdle = true;
    }
</script>

<h2 class="flex gap-4 mb-4 items-center">
    <span class="text-xl" >{day}-{task}</span>
    <span>{taskdata.title}</span>
    <StatusBadge status={myBest[taskKey]?.status} />
</h2>

<TaskView {taskdata} />

<hr/>

<div class="my-4 border-1 border-onContainer rounded-md p-1 text-base min-h-[5lh]">
    <CodeMirror bind:value={code} on:change={codechanged}
        placeholder={"ソースコード"}
        tabSize={4} 
        lineWrapping={true}
        lang={python()}
    />
</div>

<button class="button" onclick={runCode} disabled={!isIdle}>
    提出
</button>
<hr/>

{#if judgeResults.length > 0}
<table class="result-table mb-10">
    <thead>
        <tr>
            <th>テストケース</th>
            <th>結果</th>
            <th>実行時間</th>
        </tr>
    </thead>
    <tbody>
        {#each judgeResults as {caseName, status, executionTime}}
            <tr>
                <td>{caseName}</td>
                <td><StatusBadge {status} /></td>
                <td>{executionTime > 0 ? `${executionTime} ms` : "-"}</td>
            </tr>
        {/each}
    </tbody>
    {#if finalResult}
    <tfoot>
        <tr>
            <td>ジャッジ結果</td>
            <td><StatusBadge status={finalResult.status} /></td>
            <td>{finalResult.executionTime > 0 ? `${finalResult.executionTime} ms` : "-"}</td>
        </tr>
    </tfoot>
    {/if}
</table>
<hr/>
{/if}

{#await myResultsPromise then results}
{#if results.length > 0}
    <h3 class="text-lg">提出履歴</h3>
        <table class="result-table mb-10">
            <thead>
                <tr>
                    <th class="w-[15rem]">提出日時</th>
                    <th>結果</th>
                    <th>実行時間</th>
                    <th class="w-[7rem]">コード復元</th>
                </tr>
            </thead>
            <tbody>
                {#each results as {date, status, executionTime, code:oldcode}}
                    <tr>
                        <td>{date}</td>
                        <td><StatusBadge {status} /></td>
                        <td>{executionTime > 0 ? `${executionTime} ms` : "-"}</td>
                        <td>
                            <div class="flex justify-center cursor-pointer">
                                <Icon icon="mdi:history" class="text-primary text-xl" 
                                onclick={() => code=oldcode}/>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
{/await}