export const allNativeEvents = new Set()
export const registrationNameDependencies = {}

// registrationName 注册名称 onChange
// dependencies 依赖事件 [input, keydown, change]
export function registerTwoPhaseEvent(registrationName, dependencies){
    registerDirectEvent(registrationName, dependencies) // onClick
    registerDirectEvent(registrationName + 'Capture', dependencies) // onClickCapture
}

export function registerDirectEvent(registrationName, dependencies){
    registrationNameDependencies[registrationName] = dependencies
    for(let i = 0; i < dependencies.length; i++){
        allNativeEvents.add(dependencies[i])
    }
}