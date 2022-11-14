## 各函数用途

- pickArbitraryLaneIndex。
- getHighestPriorityLanes
- getHighestPriorityLanes

## render 流程

从 updateContainer 开始

- requestEventTime 计算 eventTime，这个是用来干嘛的？
- requestUpdateLane 计算 lane
  - 调用 getCurrentPriorityLevel 获取当前 react 调度优先级(schedulerPriority)，比如 97
  - schedulerPriorityToLanePriority 将 react 调度优先级（97）转成 lane 优先级(schedulerLanePriority)，比如 DefaultLanePriority(8)
  - findUpdateLane
    - pickArbitraryLane(lane)获取 lane 最右边的 1，比如 3584 最右边的 1 就是 512，这个结果就是 requestUpdateLane 的结果
- createUpdate 根据 eventTime 和 lane 创建更新对象 update
- enqueueUpdate 将 update 对象添加到 fiber.updateQueue 中
- 调用 scheduleUpdateOnFiber 调度更新
  - markUpdateLaneFromFiberToRoot
  - markRootUpdated 标记 root 节点有一个挂起的更新。
    - root.pendingLanes |= lane
  - ensureRootIsScheduled(root, eventTime);
    - markStarvedLanesAsExpired(root, currentTime)，调度器每次 yield 都会调用这个函数
      - 遍历 root.pendingLanes 的每一个 lane，计算每个 lane 的过期时间，并存储在 root.expirationTimes 中
      - 如果过期的话，则将过期的 lane 添加到 root.expiredLanes |= lane;
