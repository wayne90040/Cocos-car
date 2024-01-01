import { _decorator, Component, Node, ParticleSystemComponent, Vec3 } from 'cc';
import { RoadMoveType, RoadPoint, RoadPointType } from './RoadPoint';
import { CustomEventListener } from '../notification/CustomEventListener';
import { EventName } from '../notification/EventName';
import { AudioManager } from './AudioManager';
import { AudioResource } from '../Constants';
const { ccclass, property } = _decorator;

/**
 * @TODO 
 * AI Car and Main Car are use same logic in current,
 * So they need to be separated
 */
@ccclass('Car')
export class Car extends Component {

    @property
    private maxSpeed: number = 0.2;

    private _curRoadPoint: RoadPoint = null;
    private _pointA: Vec3 = new Vec3();
    private _pointB: Vec3 = new Vec3();
    private _isRunning: boolean = false;
    private _tempVec3 = new Vec3();
    private _offset: Vec3 = new Vec3();
    private _originRotation: number = 0;
    private _targetRotation: number = 0;
    private _rotMeasure: number = 0;

    /** 小車速率 */
    private _curSpeed: number = 0.1;
    /** 加速度 */
    private _accelerate: number = 0.2;

    /**
     * 圓心
     */
    private _centerPoint = new Vec3();

    /**
     * To judge which is a.i car and player car.
     */
    private isMainCar: boolean = false;

    /**
     * @TODO Rename
     * Customer is moving, so car can't move. 
     */
    private isInOrder: boolean = false;

    /**
     * To judge braking animation
     */
    private isBraking: boolean = false;
    private _gas: ParticleSystemComponent = null;

    protected start(): void {
        CustomEventListener.on(EventName.FINISH_WALK, this.finishWalk, this);
    }

    protected update(dt: number): void {

        if (!this._isRunning || this.isInOrder) {
            return;
        }

        this._offset.set(this.node.worldPosition);

        this._curSpeed += this._accelerate * dt;
        this._curSpeed = Math.min(this._curSpeed, this.maxSpeed);
        // this._curSpeed = Math.max(0.001, this._curSpeed);
        if (this._curSpeed <= 0.001) {
            this._isRunning = false;
            if (this.isBraking) {
                this.isBraking = false;
                CustomEventListener.dispatchEvent(EventName.END_BRAKING)
            }
        }


        switch (this._curRoadPoint.moveType) {
            case RoadMoveType.LINE:
                const z = this._pointA.z - this._pointB.z;
                const x = this._pointA.x - this._pointB.x;

                if (z !== 0) {
                    if (z > 0) {
                        this._offset.z += this._curSpeed;
                        if (this._offset.z > this._pointB.z) {
                            this._offset.z = this._pointB.z;
                        }
                    }
                    else {
                        this._offset.z -= this._curSpeed;
                        if (this._offset.z < this._pointB.z) {
                            this._offset.z = this._pointB.z;
                        }
                    }
                }
                else if (x !== 0) {
                    if (x > 0) {
                        this._offset.x -= this._curSpeed;
                        if (this._offset.x < this._pointB.x) {
                            this._offset.x = this._pointB.x;
                        }
                    }
                    else {
                        this._offset.x += this._curSpeed;
                        if (this._offset.x > this._pointB.x) {
                            this._offset.x = this._pointB.x;
                        }
                    }
                }
                break;
            case RoadMoveType.CURVE:
                /**
                 * 旋轉
                 */
                // 順時 or 逆時
                const singal = this._targetRotation > this._originRotation ? 1 : -1;
                // 需要旋轉的角度
                const needRotation = this._targetRotation - this._originRotation;
                // 當前旋轉角度
                const curRoatation = this._convert(this.node.eulerAngles.y);
                // 下一幀需要旋轉多少度
                let nextRoatation = (curRoatation - this._originRotation) + (this._curSpeed * this._rotMeasure * singal);
                if (Math.abs(nextRoatation) > Math.abs(needRotation)) {
                    nextRoatation = needRotation;
                }

                const target = nextRoatation + this._originRotation;
                this._tempVec3.set(0, target, 0);
                this.node.eulerAngles = this._tempVec3;

                /**
                 * TODO: 移動
                 * 需要惡補三維矩陣繞
                 * 第二集 19:45
                 */

                // const sin = Math.sin(nextRoatation * Math.PI / 180); // 單位是弧度, 需要轉換 角度成弧度
                // const cos = Math.cos(nextRoatation * Math.PI / 180);
                // const xLength = this._pointA.x - this._centerPoint.x;
                // const zLength = this._pointA.z - this._centerPoint.z;
                // const xPos = xLength * cos + zLength * sin + this._centerPoint.x;
                // const zPos = -xLength * sin + zLength * cos + this._centerPoint.z;
                // this._offset.set(xPos, 0, zPos);

                /**
                 * 可以直接套 API 等於上面的算法
                 */
                const radian = nextRoatation * Math.PI / 180; // 角度轉換成弧度
                Vec3.rotateY(this._offset, this._pointA, this._centerPoint, radian);
                break;
        }
        this.node.setWorldPosition(this._offset);

        Vec3.subtract(this._tempVec3, this._pointB, this._offset);

        if (this._tempVec3.length() <= 0.01) {
            this._arrivalStop();
        }
    }

    /**
     * 車子初始進入點 
     * @param entry Node has RoadPoint
     */
    public setEntry(entry: Node, isMainCar: boolean = false) {
        this.node.setWorldPosition(entry.worldPosition);
        this.isMainCar = isMainCar;
        this._curRoadPoint = entry.getComponent(RoadPoint);
        if (!this._curRoadPoint) {
            // This node not apply `RoadPoint` component
            return;
        }

        this._pointA.set(entry.worldPosition);
        this._pointB.set(this._curRoadPoint.next.worldPosition);

        // 用兩點判斷車頭朝向
        const z = this._pointA.z - this._pointB.z;
        const x = this._pointA.x - this._pointB.x;


        if (z !== 0) {
            /**
             * @todo There maybe have some qusetions for car face where
             */
            this.node.eulerAngles = z < 0 ? new Vec3(0, 270, 0) : new Vec3(0, 90, 0);
        }
        else if (x !== 0) {
            this.node.eulerAngles = x > 0 ? new Vec3() : new Vec3(0, 90, 0);
        }

        if (this.isMainCar) {
            const gasNode = this.node.getChildByName('gas');
            this._gas = gasNode.getComponent(ParticleSystemComponent);
            this._gas.play();
        }
    }

    /**
     * 開始
     */
    public startRunning() {
        if (this._curRoadPoint) {
            this._isRunning = true;
            this._curSpeed = 0;
            this._accelerate = 0.2;
        }
    }

    /**
     * 停止
     */
    public stopRunning() {
        // this._isRunning = false;
        this._accelerate = -0.3;
        this.isBraking = true;
        CustomEventListener.dispatchEvent(EventName.START_BRAKING, this.node);
        AudioManager.playSound(AudioResource.STOP);
    }

    /**
     * 到站, 到下一個站點(Node);
     */
    private _arrivalStop() {
        console.log("===== Arrival Stop =====");
        this._pointA.set(this._pointB);
        this._curRoadPoint = this._curRoadPoint.next.getComponent(RoadPoint);  // Next stop

        if (this._curRoadPoint.next) {
            this._pointB.set(this._curRoadPoint.next.worldPosition);


            // Only player car need to judge greeting, platforming customer.
            if (this.isMainCar) {
                if (this.isBraking) {
                    this.isBraking = false;
                    CustomEventListener.dispatchEvent(EventName.END_BRAKING);
                }

                if (this._curRoadPoint.type === RoadPointType.GREETING) {
                    this.greeting();
                }
                else if (this._curRoadPoint.type === RoadPointType.PLATFORM) {
                    this.platforming();
                }
                else if (this._curRoadPoint.type === RoadPointType.END) {
                    AudioManager.playSound(AudioResource.WIN);
                }
            }

            // 判斷是否需要轉彎
            switch (this._curRoadPoint.moveType) {

                case RoadMoveType.CURVE:

                    console.log("CURVE");

                    if (this._curRoadPoint.clockwise) {
                        // 順時針
                        this._originRotation = this._convert(this.node.eulerAngles.y);
                        this._targetRotation = this._originRotation - 90;

                        // TODO 這邊應該會有問題 
                        /**
                         * 算法是 
                         * 順時針 
                         * 0 -> 90 
                         * 90 -> 180
                         * 180 -> 270
                         * 270 -> 360
                         * 求圓心
                         */
                        if ((this._pointB.z > this._pointA.z && this._pointB.x > this._pointA.x) ||
                            (this._pointB.z > this._pointA.z && this._pointB.x < this._pointA.x)) {
                            this._centerPoint.set(this._pointB.x, 0, this._pointA.z);
                        }
                        else {
                            this._centerPoint.set(this._pointA.x, 0, this._pointB.z);
                        }
                    }
                    else {
                        // 逆時針
                        this._originRotation = this._convert(this.node.eulerAngles.y);
                        this._targetRotation = this._originRotation + 90;
                        if ((this._pointB.z > this._pointA.z && this._pointB.x > this._pointA.x) ||
                            (this._pointB.z < this._pointA.z && this._pointB.x < this._pointA.x)) {
                            this._centerPoint.set(this._pointB.x, 0, this._pointA.z);
                        }
                        else {
                            this._centerPoint.set(this._pointA.x, 0, this._pointB.z);
                        }
                    }

                    Vec3.subtract(this._tempVec3, this._pointA, this._centerPoint);
                    const r = this._tempVec3.length();
                    // 角度 弧度 換算 1 度等於 x 弧度 
                    // 可能去算弧長
                    /**
                     * Math.PI * r / 2 計算出四分之一圓的周長
                     * 90度 / 四分之一圓的周長 = 每度對應的的圓周長
                     */
                    this._rotMeasure = 90 / (Math.PI * r / 2);
                    break;

                case RoadMoveType.LINE:
                    break;
            }

        }
        else {
            this._isRunning = false;
            this._curRoadPoint = null;
        }
    }

    /**
     * 度數轉換, 將負號度數轉乘正的。
     * Ex: 逆時針 -90 = 順時針 270
     * @param value 
     * @returns 
     */
    private _convert(value: number): number {
        let a = value;
        if (a <= 0) {
            a += 360;
        }
        return a;
    }

    /**
     * 接客
     */
    private greeting(): void {
        this._curSpeed = 0;
        this.isInOrder = true;
        this._gas.stop();
        CustomEventListener.dispatchEvent(EventName.GREETING, this.node.worldPosition, this._curRoadPoint.direction);
    }

    /**
     * 送客
     */
    private platforming(): void {
        this._curSpeed = 0;
        this.isInOrder = true;
        this._gas.stop();
        CustomEventListener.dispatchEvent(EventName.PLATFORM, this.node.worldPosition, this._curRoadPoint.direction);
        CustomEventListener.dispatchEvent(EventName.SHOW_COIN, this.node.worldPosition);
    }

    /**
     * When customer finish walk animate
     */
    private finishWalk(): void {
        this.isInOrder = false;
        this._gas.play();
    }
}