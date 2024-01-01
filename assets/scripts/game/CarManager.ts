import { _decorator, Component, Node } from 'cc';
import { Car } from './Car';
const { ccclass, property } = _decorator;

@ccclass('CarManager')
export class CarManager extends Component {

    @property({
        type: Car
    })
    mainCar: Car = null;

    public resetCar(points: Node[]) {
        if (points.length <= 0) {
            return;
        }
        this._crtMainCar(points[0]);
    }

    public startRunning(): void {
        this.mainCar.startRunning();
    }

    public stopRunning(): void {
        this.mainCar.stopRunning();
    }

    private _crtMainCar(point: Node) {
        this.mainCar.setEntry(point, true);
    }
}

