import  type { PageLoad } from "./$types";
import { fetchTaskData, getTaskKey } from "$lib/database";

export const load: PageLoad = async ({params}) => {
    const {day, task} = {...params};
    const key = getTaskKey(day, task);
    const taskdata = await fetchTaskData(key);
    return { taskdata, day, task};
}