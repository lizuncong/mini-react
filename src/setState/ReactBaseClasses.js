import { SyncLane } from './ReactFiberLane'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'

const classComponentUpdater = {
    enqueueSetState(inst, payload) {
        const fiber = get(inst)
        const eventTime = requestEventTime();
        const lane = requestUpdateLane(fiber); // 计算本次更新的优先级
        // eventTime计算超时时间 lane任务优先级，lane越小优先级越高
        const update = createUpdate(eventTime, lane) // 创建更新对象
        update.payload = payload
        enqueueUpdate(fiber, update)

        scheduleUpdateOnFiber(fiber)
    }
}
function enqueueUpdate(fiber, update){
    fiber.updateQueue.push(update)
}
function createUpdate(eventTime, lane){
    return { eventTime, lane }
}
function requestUpdateLane(fiber){
    // 按当前事件的优先级来计算分配lane
    return SyncLane
}
function requestEventTime(){
    // 任务是有优先级的，优先级高的会打断优先级低的
    // 如果低优先级任务超时了，则优先级高的不能再打断优先级低的任务
    return performance.now(); // 程序从启动到现在的时间，是用来计算任务的过期时间的
}
function get(inst){
    return inst._reactInternals
}
export class Component {
    constructor(){
        this.updater = classComponentUpdater
    }
    setState(partialState, callback){
        this.updater.enqueueSetState(this, partialState)
    }
}

