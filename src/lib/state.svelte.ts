import type {  Student , Best} from "$lib/setting";

export const currentStudent = $state({
    studentID: "",
    displayName: "",
    email: "",
    uid: "",
    isAdmin: false,
} as Student);

export const myBest= $state({} as {[taskStr:string]: Best});