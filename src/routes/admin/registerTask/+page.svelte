<script lang="ts">
    import CodeMirror from 'svelte-codemirror-editor';
    import {python} from '@codemirror/lang-python';
    import TaskView from '$lib/TaskView.svelte';
    import type{TaskData} from '$lib/setting';
    import {submitTask} from '$lib/database';

    let day:string = $state("");
    let task:string = $state("");
    let json:string = $state("");
    let taskdata:TaskData|undefined = $derived.by(()=>{
        try{
            const rawdata = JSON.parse(json);
            if(rawdata as TaskData){
                return rawdata;
            }
            else{
                return undefined;
            }
        }
        catch(e){
            return undefined;
        }
    });
    
    let title:string = $derived.by(()=>{
        if(taskdata){
            return taskdata.title;
        }
        else{
            return "";
        }
    });

    let isValid:boolean = $derived.by(()=>{
        if(taskdata){
            return title.length > 0 && day.length == 2 && task.length == 1;
        }
        else{
            return false;
        }
    });

    async function submit(){
        const result = confirm("登録しても良いですか？");
        if(result) {
            await submitTask({day, task, title}, json)
            .then(()=>{
                alert("登録しました。");
                json = "";
                task = "";
            })
            .catch((e)=>{
                alert("登録に失敗しました。{}");
                console.error(e);
            });
        }
    }
    
</script>

<h3>問題の登録</h3>
<div class="grid grid-cols-[2rem_1fr_2rem_1fr] gap-4">
    <div>day</div>
    <input type="text" bind:value={day} class="border w-12 px-1"/>
    
    <div>task</div>
    <input type="text" bind:value={task} class="border w-12 px-1"/>
    
    <div>json</div>
    <textarea bind:value={json} rows="2" class="border col-start-2 col-end-5 p-1" ></textarea>
</div>

<hr/>

{#if isValid && taskdata}
<h2 class="flex gap-4 mb-4 items-center">
    <span class="text-xl" >{day}-{task}</span>
    <span>{title}</span>
</h2>

<TaskView {taskdata} />

<div class="my-4 border-1 border-onContainer rounded-md p-1 text-base min-h-[5lh]">
    <CodeMirror value={taskdata.placeholder} 
        placeholder={"ソースコード"}
        tabSize={4} 
        lineWrapping={true}
        lang={python()}
        readonly={true}
    />
</div>

<hr/>
<button class="button" onclick={submit}>
    データ登録 
</button>

{/if}
