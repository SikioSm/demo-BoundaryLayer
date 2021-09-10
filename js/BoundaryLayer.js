import {  Utils, BaseObject3D, } from '../libs/thing.module.js';
import { BoundaryVertexData } from './BoundaryVertexData.js';

export class BoundaryLayer extends BaseObject3D {

	constructor(param = {}) {
		super(param);
		this._node = [];
		this._UVModeType = "Tile";
		for (let i = 0; i < param.localData.length; i++) {
			const fenceGeo = new BoundaryVertexData({
				boundary: param.localData[i],
				extrudeHeight: param.extrudeHeight,

			});
			// const node = Utils.createObject('BoundaryLayerNode', { external: { uScene: this.node._uScene, param: param }});
			const node = Utils.createObject('CustomNode', { uScene: this.node._uScene, vertexData: fenceGeo.vertexData, materialData: { type: param.materialDataType || "Unlit" }});

			this._node[i] = node;
			node.setStyle(this.bodyNode.getStyle());
			this.bodyNode.add(node);
		}
	}

	setUvType(type) {
		if (this._UVModeType !== type) {
			if (type === UVModeType.Tile || type === UVModeType.Stretch) {
				for (let i = 0; i < this._node.length; i++) { this._node[i].swapAttribute('uv', 'uv2') }
				this._UVModeType = type;
			}
			else {
				console.warn('there are unsupported type');
			}
		}
	}

}