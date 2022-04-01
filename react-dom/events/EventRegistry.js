// 用于手机所有的原生事件名称，最后根据这个集合注册原生事件
export const allNativeEvents = new Set(); // ['click']

/**
 * 合成事件名称和原生事件名称依赖关系关系
 */
export const registrationNameDependencies = {}; //  { onClick: ['click'], onClickCapture: ['click'] }

export function registerTwoPhaseEvent(registrationName, dependencies){
  registerDirectEvent(registrationName, dependencies);
  registerDirectEvent(registrationName + 'Capture', dependencies);
}

export function registerDirectEvent(registrationName, dependencies) {
  registrationNameDependencies[registrationName] = dependencies;

  for (let i = 0; i < dependencies.length; i++) {
    allNativeEvents.add(dependencies[i]);
  }
}
