import PyodideWorker from "$lib/pyodide.worker?worker";
import { reduceStatus} from "$lib/setting";
import type { ResultStatus} from "$lib/setting";
import type { RunResponse } from "$lib/pyodide.worker";

export type TestInput = {
    input: string[];
    code: string;
    answer: string[];
    timelimit: number;
};

export type TestResult = {
    output: string[];
    executionTime: number;
    status: ResultStatus;
};
type IsSameLine =  (outputLine: string, answerLine: string) => boolean;

class PythonRunner{
    private worker: InstanceType<typeof PyodideWorker>;
    private lock?:Promise<void>;
    isSameLine : IsSameLine;

    constructor(){
        this.isSameLine = (outputLine: string, answerLine: string) => {
            return outputLine === answerLine;
        };
        this.worker = new PyodideWorker();
        this.resetWorker();
    }
    async resetWorker(){
        this.lock = new Promise((resolve) => {
            this.worker.onmessage = (message: MessageEvent) => resolve();
        });
        this.worker.postMessage(["init"]);
        return this.lock;
    }

    async testCodeAsync(testInput:TestInput): Promise<TestResult>{
        await this.lock;

        const {input, code, answer, timelimit} = testInput;
        const startTime = performance.now();        
        let {output, status} = await Promise.race<{output: string[], status: ResultStatus}>([
            new Promise(async (resolve) => {
                const result = await this.runWorkerAsync(input, code);
                resolve(result);
            }),
            new Promise((resolve) => {
                setTimeout(()=>resolve({output:["timelimit exceeded"], status:"TLE"}), timelimit*1.5);
            }),
        ]);
        const executionTime = Math.round(performance.now() - startTime);
        const statuses = [status];
        if(status === "TLE"){
            this.worker.terminate();
            this.worker = new PyodideWorker();
            this.resetWorker();
        }
        else if(status === "AC"){
            if(this.isWA(output, answer)){
                statuses.push("WA");
            }
        }
        if(executionTime > timelimit) statuses.push("TLE");
        return { output, executionTime, status: reduceStatus(statuses) };
    }
    

    private runWorkerAsync(input: string[], code: string): Promise<RunResponse> {
        return new Promise((resolve)=>{
            this.worker.onmessage = (message: MessageEvent) => {
                const data = message.data as RunResponse;
                resolve(data);
                if(data.status === "INIT"){
                    console.log("PythonRunner: 初期化完了");
                }
            }
            this.worker.postMessage(["execute",{input,code}]); 
        });
    }

    private isWA(output:string[], answer:string[]): boolean {
        const tout:string[] = [];
        const tans:string[] = [];
        for(let i=0; i<Math.max(output.length, answer.length); i++){
            tout.push((output[i] ?? "").trim());
            tans.push((answer[i] ?? "").trim());
        }
        for(let i=0; i<tout.length; i++){
            if(!this.isSameLine(tout[i], tans[i])) return true;
        }
        return false;
    }
}
export const pythonRunner = new PythonRunner();