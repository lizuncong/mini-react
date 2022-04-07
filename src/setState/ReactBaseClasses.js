import { SyncLane } from './ReactFiberLane'
const classComponentUpdater = {
    enqueueSetState(inst, payload){
        const fiber = get(inst)
        const eventTime = requestEventTime()
        const lane = requestUpdateLane(fiber)
        const update = createUpdate() // 创建新的更新对象
    }
}

function createUpdate(){
    
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


class Component{
    constructor(){
        this.updater = classComponentUpdater
    }

    setState(partialState){
        this.updater.enqueueSetState(this, partialState)
    }
}