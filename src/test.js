var root = {}
root.callbackNode = scheduleCallback(3, performConcurrentWorkOnRoot.bind(null, root));

function performConcurrentWorkOnRoot(root) {

}