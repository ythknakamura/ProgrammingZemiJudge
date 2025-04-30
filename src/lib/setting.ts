const ResultStatus = {AC:0, WJ: 1, TLE:2, WA:3, RE:4, INIT:9} as const;
export type ResultStatus = keyof typeof ResultStatus;

export const reduceStatus = (statuses: ResultStatus[], best: boolean) => {
    if(best){
        return statuses.reduce((acc, status) => ResultStatus[status] < ResultStatus[acc] ? status : acc);
    }
    else{
        return statuses.reduce((acc, status) => ResultStatus[status] > ResultStatus[acc] ? status : acc);
    }
}

/** プログラムへの入力と出力のセット */
export type IAData = {
    input: string[];
    answer: string[];
};

/** 問題の定義 */
export type TaskData = {
    title: string;
    statements: string[];
    constraints: string[];
    placeholder: string;
    inputFormat:string[];
    outputFormat:string;
    sampleIA: (IAData & {description?: string})[];
    testcaseIA: IAData[];
};

/** 生徒情報 */
export type Student = {
    uid : string;
    studentID : string;
    displayName : string;
    email : string;
};

export type MyResult = {
    code:string,
    status:ResultStatus,
    date: string,
    executionTime:number,
};

export type Best = {
    status: ResultStatus,
    dateStr:string,
}

export type StudentInfo = Student & {
    best : {[taskKey:string]: Best};
};