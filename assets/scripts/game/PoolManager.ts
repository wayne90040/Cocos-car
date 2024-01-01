import { Prefab, _decorator, instantiate, Node } from 'cc';

/**
 * 節點池
 */
export class PoolManager {

    public static map = new Map<string, Node[]>();

    public static getNode(prefab: Prefab, parent: Node) {
        const name = prefab.name;
        let node: Node = null;

        if (this.map.has(name)) {
            node = this.map.get(name).pop();
        }
        // else {
        //     node = instantiate(prefab);
        // }
        if (!node) {
            node = instantiate(prefab);
        }
        node.setParent(parent);
        return node;
    }

    public static setNode(target: Node) {
        const name: string = target.name;
        if (this.map.has(name)) {
            this.map.get(name).push(target);
        }
        else {
            this.map.set(name, [target]);
        }
    }
}

