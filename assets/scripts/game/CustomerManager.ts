import { _decorator, AnimationComponent, Component, Node, Vec3 } from 'cc';
import { CustomEventListener } from '../notification/CustomEventListener';
import { EventName } from '../notification/EventName';
import { AudioManager } from './AudioManager';
import { AudioResource } from '../Constants';
const { ccclass, property } = _decorator;

export enum CustomerState {
    NONE,
    /** 接客 */
    GREETING,
    /** 下客 */
    PLATFORM,
}

@ccclass
export class CustomerManager extends Component {

    @property({
        type: [Node]
    })
    customers: Node[] = [];

    /**
     * 動畫播放的長度
     */
    @property
    duration: number = 2;

    private current: Node = null;
    private tempPosition: Vec3 = new Vec3();
    private startPosition: Vec3 = new Vec3();
    private endPosition: Vec3 = new Vec3();;
    private isInOrder: boolean = null;
    private deltaTime: number = 0;
    private customerState: CustomerState = CustomerState.NONE;


    protected start(): void {
        CustomEventListener.on(EventName.GREETING, this.greeting, this);
        CustomEventListener.on(EventName.PLATFORM, this.platforming, this);
    }

    protected update(dt: number): void {
        if (this.isInOrder) {
            this.deltaTime += dt;

            if (this.deltaTime > this.duration) {   // 走路動畫播完
                this.isInOrder = false;
                this.deltaTime = 0;
                this.current.active = false;

                if (this.customerState === CustomerState.PLATFORM) {
                    this.current = null;
                }
                CustomEventListener.dispatchEvent(EventName.FINISH_WALK);

                if (this.customerState === CustomerState.GREETING) {
                    AudioManager.playSound(AudioResource.INCAR);
                }
            }
            else {                                  // 
                Vec3.lerp(this.tempPosition, this.startPosition, this.endPosition, this.deltaTime / this.duration);
                this.current.setWorldPosition(this.tempPosition);
            }
        }
    }

    private greeting(...args: any[]): void {
        const randomIndex = Math.floor(Math.random() * this.customers.length);
        this.current = this.customers[randomIndex];
        this.customerState = CustomerState.GREETING;
        this.isInOrder = true;

        if (!this.current) {
            return;
        }

        const carPosition: Vec3 = args[0];
        const direction: Vec3 = args[1];

        Vec3.multiplyScalar(this.startPosition, direction, 1.4);
        this.startPosition.add(carPosition);

        Vec3.multiplyScalar(this.endPosition, direction, 0.5);
        this.endPosition.add(carPosition);

        this.current.active = true;
        this.current.setWorldPosition(this.startPosition);

        // 顧客的朝向
        if (direction.x !== 0) {
            if (direction.x > 0) {
                this.current.eulerAngles = new Vec3(0, -90, 0);
            }
            else {
                this.current.eulerAngles = new Vec3(0, 90, 0);
            }
        }
        else if (direction.z !== 0) {
            if (direction.z > 0) {
                this.current.eulerAngles = new Vec3(0, 180, 0);
            }
            else {

            }
        }

        const animation = this.current.getComponent(AnimationComponent);
        animation.play("walk");
    }

    private platforming(...args: any[]): void {
        this.customerState = CustomerState.PLATFORM;
        this.isInOrder = true;

        const carPosition: Vec3 = args[0];
        const direction: Vec3 = args[1];

        Vec3.multiplyScalar(this.startPosition, direction, 0.5);
        this.startPosition.add(carPosition);

        Vec3.multiplyScalar(this.endPosition, direction, 1.4);
        this.endPosition.add(carPosition);

        this.current.active = true;
        this.current.setWorldPosition(this.startPosition);

        // 顧客的朝向
        if (direction.x !== 0) {
            if (direction.x > 0) {
                this.current.eulerAngles = new Vec3(0, 90, 0);
            }
            else {
                this.current.eulerAngles = new Vec3(0, -90, 0);
            }
        }
        else if (direction.z !== 0) {
            if (direction.z > 0) {

            }
            else {
                this.current.eulerAngles = new Vec3(0, 180, 0);
            }
        }
        AudioManager.playSound(AudioResource.GETMONEY);
        const animation = this.current.getComponent(AnimationComponent);
        animation.play("walk");
    }
}