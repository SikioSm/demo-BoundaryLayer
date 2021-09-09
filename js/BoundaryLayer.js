import {  Utils, BaseObject3D } from '@uino/thing';
import { BoundaryVertexData } from './BoundaryVertexData.js';

export class BoundaryLayer extends BaseObject3D {

	constructor(param = {}) {
		super(param);
		this.fenceHeight = [];
		this.fenceLength = [];
		this._node = [];
		for (let i = 0; i < param.localData.length; i++) {
			const fenceGeo = new BoundaryVertexData({
				boundary: param.localData[i],
				extrudeHeight: param.extrudeHeight,

			});
			this.fenceHeight[i] = fenceGeo.fenceHeight;
			this.fenceLength[i] = fenceGeo.fenceLength;

			// const node = Utils.createObject('BoundaryLayerNode', { external: { uScene: this.node._uScene, param: param }});
			const node = Utils.createObject('CustomNode', { uScene: this.node._uScene, vertexData: fenceGeo.vertexData, materialData: { type: "Unlit" }});

			this._node[i] = node;
			node.setStyle(this.bodyNode.getStyle());
			this.bodyNode.add(node);
		}
	}

	setUvType(type) {
		for (let i = 0; i < this._node.length; i++) { this._node[i].swapAttribute('uv', 'uv2') }
	}

}