export enum WsStatus {
    ALL = -1,
    NORMAL = 0, // 正常
    FINISHED = 1, // 已封裝
    REJECTED = 2, // 已廢止
    DELETED = 9, // 已刪除
    TO_BE_STORE = 3, // 待歸檔
    STORED = 4 // 已歸檔
}
