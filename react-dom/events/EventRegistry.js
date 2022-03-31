// 用于手机所有的原生事件名称，最后根据这个集合注册原生事件
export const allNativeEvents = new Set();

/**
 * 注册名称和事件名称映射关系
 */
export const registrationNameDependencies = {};

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
