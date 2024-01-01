import { _decorator, Component, Node } from 'cc';
import { GameMap } from './GameMap';
const { ccclass, property } = _decorator;

@ccclass('MapManager')
export class MapManager extends Component {
    public curPaths: Node[] = [];

    public resetMap() {
        /**
         * @todo 測試第二張圖
         */
        const current = this.node.children[1].getComponent(GameMap);
        this.curPaths = current.paths;
    }
}

