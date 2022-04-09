import { SyncLane } from './ReactFiberLane'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
const classComponentUpdater = {
    enqueueSetState(inst, payload){
        const fiber = get(inst)
        const eventTime = requestEventTime()
        const lane = requestUpdateLane(fiber)
        const update = createUpdate(eventTime, lane) // 创建新的更新对象
        update.payload = payload
        enqueueUpdate(fiber, update)
        scheduleUpdateOnFiber(fiber)
    }
}

function enqueueUpdate(fiber, update){
    fiber.updateQueue.push(update)
}

function createUpdate(eventTime, lane){
    return {
        eventTime,
        lane
    }
}

function requestEventTime(){
    return performance.now()
}
function get(inst){
    return inst._reactInternal
}

function requestUpdateLane(fiber){
    return SyncLane
}


export class Component{
    constructor(){
        this.updater = classComponentUpdater
    }

    setState(partialState){
        this.updater.enqueueSetState(this, partialState)
    }
}