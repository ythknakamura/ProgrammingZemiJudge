
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDoc, getDocs, setDoc, addDoc, doc, 
    serverTimestamp,query, where, orderBy, collectionGroup} from "firebase/firestore/lite";
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword} from "firebase/auth";
import type {TaskData, ResultStatus, MyResult, StudentInfo} from "./setting";
import {currentStudent, myBest} from '$lib/state.svelte';
import { PUBLIC_API_KEY, PUBLIC_AUTH_DOMAIN, PUBLIC_PROJECT_ID, PUBLIC_MESSAGING_SENDER_ID, PUBLIC_APP_ID} from "$env/static/public";

const firebaseConfig = {
    apiKey: PUBLIC_API_KEY,
    authDomain: PUBLIC_AUTH_DOMAIN,
    projectId: PUBLIC_PROJECT_ID,
    messagingSenderId: PUBLIC_MESSAGING_SENDER_ID,
    appId: PUBLIC_APP_ID,
};

export const isAdmin = () => currentStudent.email === "admin@kenryo.ed.jp";

export type TaskHead = {day:string, task:string, title:string};
export type AllTaskHead =  { [daystr:string]:TaskHead[] };
export const getTaskKey = (day:string, task:string) => `${day}-${task}`;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const Col = {
    taskHead: "taskHead", 
    taskBody: "taskBody",
    user: "user",
    loginLog: "loginLog",
    submitLog: "submitLog",
    dailyInfo: "dailyInfo",
    bestResults: "bestResults",
} as const;
type Col = typeof Col[keyof typeof Col];

export const allTaskHeadPromise: Promise<AllTaskHead> = fetchAllTaskHead();

export async function signIn(email:string, password:string):Promise<void> {
    try{
        const userCredential =  await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        const userData  = await getDoc(doc(db, Col.user, uid));
        const data = userData.data();
        currentStudent.uid = uid;
        currentStudent.email = email;
        currentStudent.studentID = data!.studentID;
        currentStudent.displayName = data!.displayName;
        await addDoc(collection(db, Col.loginLog), {
            date: serverTimestamp(),
            ...currentStudent,
        });
    }
    catch (error) {
        console.error("Error signing in:", error);
        currentStudent.uid = "";
        currentStudent.email = "";
        currentStudent.studentID = "";
        currentStudent.displayName = "";
    }
}

export async function addUser(studentID:string, displayName:string, email:string, password:string){
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    await setDoc(doc(db, Col.user, uid), {
        studentID,
        displayName,
        email,
        uid,
    });
}

export async function postResult(day:string, task:string, code:string, status:ResultStatus, executionTime:number) {
    const result = {
        date: serverTimestamp(),
        taskKey: getTaskKey(day, task),
        displayName:currentStudent.displayName,
        studentID: currentStudent.studentID,
        uid: currentStudent.uid,
        code,
        status,
        executionTime,
    };
    await addDoc(collection(db, Col.submitLog), result);
}

export async function fetchAllUsersData(){
    const allUsersData: StudentInfo[] = [];
    const userDocs = await getDocs(collection(db, Col.user));
    userDocs.forEach(doc => {
        const data = doc.data();
        allUsersData.push({
            uid: doc.id,
            studentID: data.studentID,
            displayName: data.displayName,
            email: data.email,
            best:{},
        } as StudentInfo);
    });
    const bestDocs = await getDocs(collectionGroup(db, Col.bestResults));
    bestDocs.forEach(doc => {
        const taskKey = doc.id;
        const uid = doc.ref.parent.parent?.id;
        const status = doc.data().status;
        const dateStr = formatTimeStamp(doc.data().date.toDate(), true);
        const index = allUsersData.findIndex(user => user.uid === uid);
        if(index !== -1){
            allUsersData[index].best[taskKey] = { status, dateStr };
        }
    });
    allUsersData.sort((a, b) => a.studentID.localeCompare(b.studentID));
    return allUsersData;
}

export async function fetchMyBestResults(){
    const results = await getDocs(collection(db, Col.user, currentStudent.uid, Col.bestResults));
    results.forEach(doc => {
        const data = doc.data();
        myBest[doc.id] = {
            status:data.status, 
            dateStr:formatTimeStamp(data.date.toDate(), true)};
    });
}

export async function postMyBestResult(taskKey:string, status:ResultStatus) {
    const collectionRef = collection(db, Col.user, currentStudent.uid, Col.bestResults);
    const date = serverTimestamp();
    await setDoc(doc(collectionRef, taskKey), {status, date});
}

export async function fetchMyResults(day:string, task:string): Promise<MyResult[]> {
    const submitRef = collection(db, Col.submitLog);
    const q = query(submitRef, 
        where("uid", "==", currentStudent.uid), 
        where("taskKey", "==", getTaskKey(day, task)),
        orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    const results: MyResult[] = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if(["AC", "WA", "TLE", "RE"].includes(data.status)){
            results.push({
                code:data.code, 
                status:data.status,
                date: formatTimeStamp(data.date.toDate(), false),
                executionTime:data.executionTime
            });
        } 
    });
    return results;
}


export async function submitTask(taskHeading:TaskHead, json:string) {
    const { day, task, title } = taskHeading;
    const key = getTaskKey(day, task);
    await Promise.all([
        setDoc(doc(db, Col.taskHead, key), {day, task, title}),
        setDoc(doc(db, Col.taskBody, key), {json}),
    ]);
}

export async function fetchTaskData(taskKey: string):Promise<TaskData> {
    const taskBody = await getDoc(doc(db, Col.taskBody, taskKey));
    return JSON.parse(taskBody?.data()?.json) as TaskData;
}

async function fetchAllTaskHead():Promise<{ [daystr:string]:TaskHead[]}> {
    const allTaskHead:{ [day:string]:TaskHead[]} = {};
    const heads = await getDocs(collection(db, Col.taskHead));
    heads.forEach(head => {
        const data = head.data();
        const daystr = `day${data.day}`;
        if (!allTaskHead[daystr]) allTaskHead[daystr] = [];
        allTaskHead[daystr].push(data as TaskHead);
    });
    return allTaskHead;
}


function formatTimeStamp(date:Date, short: boolean):string {
    const format = new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    const str = format.format(date);
    return short ? str.split(" ")[0] :str;
}