// 可以给fiber添加一个副作用标识符，表示此fiber对应的DOM节点需要进行何种操作
export const NoFlags = 0b000000000000000000; // 没有动作
export const Placement = 0b000000000000000010; // 添加或者创建
export const Update = 0b000000000000000100; // 更新
export const PlacementAndUpdate = 0b000000000000000110; // 移动
export const Deletion = 0b000000000000001000; // 删除

// 当flags=6，说明既要插入新位置，又要更新，这是针对移动节点的情况
