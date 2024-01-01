import { _decorator, Component, EventTouch, Node } from 'cc';
import { CarManager } from './CarManager';
import { MapManager } from './MapManager';
import { AudioManager } from './AudioManager';
import { AudioResource } from '../Constants';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    @property({
        type: CarManager
    })
    carManager: CarManager = null;

    @property({
        type: MapManager
    })
    mapManager: MapManager = null;

    protected onLoad(): void {
        this.mapManager.resetMap();
        this.carManager.resetCar(this.mapManager.curPaths);
    }

    protected start(): void {
        AudioManager.playMusic(AudioResource.BACKGROUND);
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
    }

    private touchStart(touch: Touch, event: EventTouch) {
        this.carManager.startRunning();
    }

    private touchEnd(touch: Touch, event: EventTouch) {
        this.carManager.stopRunning();
    }
}

