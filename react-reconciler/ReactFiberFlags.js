
// Don't change these two values. They're used by React Dev Tools.
export const NoFlags = /*                      */ 0b000000000000000000; // 0
export const PerformedWork = /*                */ 0b000000000000000001; // 1

// // You can change the rest (and add more).
export const Placement = /*                    */ 0b000000000000000010; // 2
export const Update = /*                       */ 0b000000000000000100; // 4
export const PlacementAndUpdate = /*           */ 0b000000000000000110; // 6
export const Deletion = /*                     */ 0b000000000000001000; // 8
// export const ContentReset = /*                 */ 0b000000000000010000; // 16
export const Callback = /*                     */ 0b000000000000100000; // 32
// export const DidCapture = /*                   */ 0b000000000001000000; // 64
// export const Ref = /*                          */ 0b000000000010000000; // 128
export const Snapshot = /*                     */ 0b000000000100000000; // 256
export const Passive = /*                      */ 0b000000001000000000; // 512
export const Hydrating = /*                    */ 0b000000010000000000; // 1024
// export const HydratingAndUpdate = /*           */ 0b000000010000000100; // 1028

// // Passive & Update & Callback & Ref & Snapshot
// export const LifecycleEffectMask = /*          */ 0b000000001110100100; // 932

// // Union of all host effects
// export const HostEffectMask = /*               */ 0b000000011111111111; // 2047

// // These are not really side effects, but we still reuse this field.
// export const Incomplete = /*                   */ 0b000000100000000000; // 2048
// export const ShouldCapture = /*                */ 0b000001000000000000; // 4096
// export const ForceUpdateForLegacySuspense = /* */ 0b000100000000000000; // 16384
