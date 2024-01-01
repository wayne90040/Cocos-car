import { _decorator, Component, instantiate, Node, ParticleSystemComponent, ParticleUtils, Prefab } from 'cc';
import { CustomEventListener } from '../notification/CustomEventListener';
import { EventName } from '../notification/EventName';
import { PoolManager } from './PoolManager';
const { ccclass, property } = _decorator;

@ccclass
export class EffectManager extends Component {

    @property({
        type: Prefab,
    })
    private brakeTrail: Prefab = null;

    @property({
        type: Prefab,
    })
    private coin: Prefab = null;

    private _followTarget: Node = null;
    private _currentBraking: Node = null;
    private _coin: ParticleSystemComponent = null;

    start() {
        CustomEventListener.on(EventName.START_BRAKING, this._startBraking, this);
        CustomEventListener.on(EventName.END_BRAKING, this._endBraking, this);
        CustomEventListener.on(EventName.SHOW_COIN, this._showCoin, this);
    }

    update(deltaTime: number) {
        if (this._currentBraking && this._followTarget) {
            this._currentBraking.setWorldPosition(this._followTarget.worldPosition);
        }
    }

    private _startBraking(...args: any[]): void {
        const follow = this._followTarget = args[0];
        this._currentBraking = PoolManager.getNode(this.brakeTrail, this.node);
        this._currentBraking.setWorldPosition(follow);
        ParticleUtils.play(this._currentBraking);
    }

    /**
     * @TODO 有 Bug, 節點池有機會存到 null 節點.
     */
    private _endBraking(): void {
        const currentBraking = this._currentBraking;  // 兩秒後, 加到節點池所以要先存起來
        ParticleUtils.stop(currentBraking);
        this.scheduleOnce(() => {
            PoolManager.setNode(currentBraking);
        }, 2);
        this._currentBraking = null;
        this._followTarget = null;
    }

    private _showCoin(...args: any[]): void {
        const pos = args[0];
        if (!this._coin) {
            const coin = instantiate(this.coin);
            coin.setParent(this.node);
            this._coin = coin.getComponent(ParticleSystemComponent);
        }
        this._coin.node.setWorldPosition(pos);
        this._coin.play();
    }
}

