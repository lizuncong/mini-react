import ReactCurrentDispatcher from './ReactCurrentDispatcher';

function resolveDispatcher() {
    const dispatcher = ReactCurrentDispatcher.current;
    if (dispatcher === null) {
        console.log('在调用hook前需要初始化 dispatcher')
    }

    return dispatcher;
}
export function useState(initialState) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(initialState);
}

export function useEffect(create, deps) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useEffect(create, deps);
}

export function useLayoutEffect(create, deps) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useLayoutEffect(create, deps);
}