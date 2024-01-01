import { _decorator, Component, Enum, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export enum RoadPointType {
    NORMAL = 0, // 普通
    START,      // 開始
    GREETING,   // 接客
    PLATFORM,   // 送客
    END,        // 結束
    AI_START    // 機器人
}

Enum(RoadPointType);

export enum RoadMoveType {
    LINE = 0, // 直線
    CURVE     // 曲線
}

Enum(RoadMoveType);

@ccclass('RoadPoint')
export class RoadPoint extends Component {

    @property({
        type: RoadPointType,
        displayOrder: 1
    })
    type = RoadPointType.NORMAL;

    @property({
        type: Node,
        displayOrder: 2,
        visible: function (this: RoadPoint) {
            return this.type !== RoadPointType.END
        }
    })
    next: Node | null = null;

    @property({
        type: RoadMoveType,
        displayOrder: 3
    })
    moveType = RoadMoveType.LINE;

    @property({
        displayOrder: 4,
        visible: function (this: RoadPoint) {
            return this.moveType === RoadMoveType.CURVE;
        }
    })
    clockwise: boolean = true;  // is順時針

    @property({
        type: Vec3,
        displayOrder: 4,
        visible: function (this: RoadPoint) {
            return this.type === RoadPointType.GREETING || this.type === RoadPointType.PLATFORM;
        }
    })
    direction = new Vec3();  // 顧客方向

    @property({
        displayOrder: 5,
        visible: function (this: RoadPoint) {
            return this.type === RoadPointType.AI_START;
        }
    })
    interval: number = 3;  // 生成間隔

    @property({
        displayOrder: 5,
        visible: function (this: RoadPoint) {
            return this.type === RoadPointType.AI_START;
        }
    })
    delayTime: number = 0;

    @property({
        displayOrder: 5,
        visible: function (this: RoadPoint) {
            return this.type === RoadPointType.AI_START;
        }
    })
    speed: number = 0.05;

    @property({
        displayOrder: 5,
        visible: function (this: RoadPoint) {
            return this.type === RoadPointType.AI_START;
        }
    })
    cars: string = "201";  // 產生 ＡI 車輛 产生车辆(,分隔) ex: 201,202

    start() {

    }

    update(deltaTime: number) {

    }
}

