const Update = 4
const Placement = 2
const Deletion = 8
const NoFlags = 0
const HostRootFiber = { id: "root", flags: 0 }
function printEffectList(finishedWork) {
    let nextEffect = finishedWork.firstEffect;
    while (nextEffect) {
        const id = nextEffect.id;
        const label = "div#" + id;
        let flagOperate = "";
        if ((nextEffect.flags & Placement) !== NoFlags) {
            flagOperate += "插入";
        }
        if ((nextEffect.flags & Update) !== NoFlags) {
            flagOperate += "更新";
        }
        if ((nextEffect.flags & Deletion) !== NoFlags) {
            flagOperate += "删除";
        }
        console.log(flagOperate + label);
        nextEffect = nextEffect.nextEffect;
    }
}
const fiberA = { id: "A1", flags: Update, return: HostRootFiber };
const fiberB = { id: "B1", flags: Update, return: fiberA };
const fiberC = { id: "C1", flags: Update, return: fiberA };
const fiberD = { id: "D0", flags: Deletion, return: fiberA };
const fiberE = { id: "E1", flags: Update, return: HostRootFiber };
const fiberF = { id: "F1", flags: Update, return: fiberE };
const fiberG = { id: "G1", flags: Update, return: fiberE };
const fiberH = { id: "H0", flags: Deletion, return: fiberE };
const fiberI = { id: "I0", flags: Deletion, return: fiberE };
function completeUnitOfWork(unitOfWork) {
    const returnFiber = unitOfWork.return;
    if (!returnFiber) return;
    const flags = unitOfWork.flags;
    // 第一步 让父节点的firstEffect指向当前节点的firstEffect
    // 注意，只有当父节点的 firstEffect 不存在时，我们才能将父节点的firstEffect指向当前节点的副作用链表表头
    if (!returnFiber.firstEffect) {
        returnFiber.firstEffect = unitOfWork.firstEffect
    }
    // 第二步 将当前节点添加到它的副作用链表中，这里需要判断当前节点是否存在副作用链表
    // 如果存在lastEffect，说明当前节点存在副作用链表
    if (unitOfWork.lastEffect) {
        if (returnFiber.lastEffect) {
            returnFiber.lastEffect.nextEffect = unitOfWork.firstEffect;
        }
        returnFiber.lastEffect = unitOfWork.lastEffect;
    }
    // 前面两步都是在向父节点提交当前节点的副作用链表，不需要放在判断当前节点是否有副作用的条件语句里面
    // flags > 1才说明该节点具有副作用，才可以提交到其父节点中
    if (flags > 1) {
        if (returnFiber.lastEffect) {
            // 第三步，将当前节点添加到其副作用链表末尾
            returnFiber.lastEffect.nextEffect = unitOfWork;
        } else {
            returnFiber.firstEffect = unitOfWork;
        }

        returnFiber.lastEffect = unitOfWork;
    }
}

function deleteChild(returnFiber, childToDelete) {
    // 需要删除的节点总是会被添加到父节点的副作用链表的最前面
    // 当调用deleteChild时，父节点的副作用链表只包含被删除的节点
    const last = returnFiber.lastEffect;
    if (last) {
        last.nextEffect = childToDelete;
        returnFiber.lastEffect = childToDelete;
    } else {
        returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
    }
    childToDelete.nextEffect = null;
}
deleteChild(fiberA, fiberD)
completeUnitOfWork(fiberB)
completeUnitOfWork(fiberC)
completeUnitOfWork(fiberA)
deleteChild(fiberE, fiberH)
deleteChild(fiberE, fiberI)
completeUnitOfWork(fiberF)
completeUnitOfWork(fiberG)
completeUnitOfWork(fiberE)
printEffectList(HostRootFiber)



