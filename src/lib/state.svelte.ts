import type {  Student , Best} from "$lib/setting";

export const currentStudent = $state({
    studentID: "",
    displayName: "",
    email: "",
    uid: "",
} as Student);

export const myBest= $state({} as {[taskStr:string]: Best});