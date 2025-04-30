<script lang="ts">
    import {addUser } from '$lib/database'
    let datastring:string = $state("");
    let studentID:string = $state("");
    let displayName:string = $state("");
    let email:string = $state("");
    let password:string = $state("");
    let message:string = $state("");
    let disable:boolean = $state(false);
    $effect(()=>{
        const data = datastring.split(",");
        studentID = data[0];
        displayName = data[1];
        email = data[2];
        password = data[3];
    });

    async function register() {
        try {
            disable = true;
            if (studentID === "" || displayName === "" || email === "" || password === "") {
                alert("すべてのフィールドを入力してください");
                return;
            }
            await addUser(studentID, displayName, email, password);
            datastring = "";
            message += `${studentID} ${displayName} ${email} ${password}を登録しました。\n`;
        }
        catch (error) {
            alert("失敗");
        }
        finally {
            disable = false;
        }
    }
</script>

<h3>ユーザーの登録</h3>
<div class="flex flex-row gap-8 p-4">
    <input type="text" bind:value={datastring} class="border" placeholder="カンマ区切りで入力" />
</div>

<div class="grid grid-cols-4 gap-4">
    <div>studentID:
        <span>{studentID}</span>
    </div>
    <div>displayName:
        <span>{displayName}</span>
    </div>
    <div>email:
        <span>{email}</span>
    </div>
    <div>password:
        <span>{password}</span>
    </div>
    <div>
        <button class="button" onclick={register} disabled={disable}>追加</button>
    </div>
</div>

<div class="border w-full mt-4">
    {message}
</div>