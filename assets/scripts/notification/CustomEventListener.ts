import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

interface IEventData {
    func: Function;
    target: any;
}

interface IEvent {
    [eventName: string]: IEventData[];
}

@ccclass('CustomEventListener')
export class CustomEventListener extends Component {
    public static handler: IEvent = {};

    // TODO: 尚未實作重複名稱事件的判斷處理
    // 目前遇到重複名稱只會移除第一個事件

    /**
     * 事件監聽
     * @param eventName
     * @param callback 
     * @param target 
     */
    public static on(eventName: string, callback: Function, target?: any) {
        // 初始化
        if (!this.handler[eventName]) {
            this.handler[eventName] = [];
        }
        const data: IEventData = { func: callback, target: target };
        this.handler[eventName].push(data);
    }

    /**
     * 取消監聽
     * @param eventName 
     * @param callback 
     * @param target 
     */
    public static off(eventName: string, callback: Function, target?: any) {
        const list = this.handler[eventName];
        if (!list || list.length <= 0) {
            return;
        }
        for (let i = 0; i < list.length; i++) {
            const event = list[i];
            if (event.func === callback && (!target || target === event.target)) {
                list.splice(i, 1);
                break;
            }
        }
    }

    public static dispatchEvent(eventName: string, ...args: any) {
        const list = this.handler[eventName];
        if (!list || list.length <= 0) {
            return;
        }
        for (let i = 0; i < list.length; i++) {
            const event = list[i];
            event.func.apply(event.target, args);
        }
    }
}