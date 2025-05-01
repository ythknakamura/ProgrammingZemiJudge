import {loadPyodide} from "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.mjs";
import type {ResultStatus} from "./setting";
export type RunRequest = {code:string, input:string[]};
export type RunResponse = {status: ResultStatus, output:string[]};

const pyodideReadyPromise = loadPyodide();

type Pyodide  =  { 
    runPython: (code: string, globals?:any) => string,
    toPy: (globals: any) => any,
    setStdin: (stdinHandler: StdinHandler) => void,
    setStdout: (stdoutHandler: {batched: (str:string) => void}) => void,
};

class StdinHandler { 
    private idx:number = 0;
    constructor(private readonly input: string[]) {}
    readonly stdin = () => this.input[this.idx++];
}

class StdoutHandler{
    private readonly buffer:string[] = [];
    readonly stdout = (str:string) => {this.buffer.push(str);};
    readonly getOutput = () => this.buffer.flat();
}

let pyodide = null as unknown as Pyodide;

self.onmessage = async(message: MessageEvent) => {
    if(message.data[0] === "execute"){
        const {code, input}: RunRequest = message.data[1];
        const stdinHandler = new StdinHandler(input);
        const stdoutHandler = new StdoutHandler();
        const globals = pyodide.toPy({});
        try{
            pyodide.setStdin(stdinHandler);
            pyodide.setStdout({batched:stdoutHandler.stdout});
            pyodide.runPython(code, {globals});
            self.postMessage({status: "AC", output: stdoutHandler.getOutput() } as RunResponse);
        } catch (error: any) {
            self.postMessage({status: "RE", output: [error.toString()] } as RunResponse);
        }
    }
    else if(message.data[0] === "init"){
        console.log("worker:初期化")
        pyodide = await pyodideReadyPromise;
        self.postMessage({status: "INIT"});
    }
    else{
        throw new Error("不明なモード");
    }
};

export {};