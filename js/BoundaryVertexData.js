import { MathUtils } from '../libs/thing.module.js';

class uvGenerator {

	constructor() {
	
	}

	// Stretch uv
	InitUV2(vertices){			
		let u_list_2 = [];
		let lengthSum = 0;
		let len = vertices.length * 0.5;// FENCE UPPER AND DOWNER

		for (let i = 0; i < len - 3; i = i + 3) {
			let dx = vertices[(i + 3) % len] - vertices[i];
			let dy = vertices[(i + 3) % len + 1] - vertices[i + 1];
			let dz = vertices[(i + 3) % len + 2] - vertices[i + 2];

			let segmentLength = Math.sqrt(dx * dx + dy * dy + dz * dz);

			u_list_2.push(lengthSum);
			lengthSum += segmentLength;
		}

		this.lengthSum = lengthSum;
		this.normalizeArray(u_list_2, lengthSum);
		this.uv = u_list_2;
		
		return u_list_2;
	}

	// 1:1 Tile uv
	InitUV(vertices , height){	
		let len = vertices.length * 0.5;
		let u_list = [];
		let lengthSum = 0;
		
		u_list.push(lengthSum);
		for(let i = 0; i < len -3; i = i + 3 ){
			
			let dx = Math.abs(vertices[i + 3] - vertices[i]) ;
			let dy = Math.abs(vertices[i + 4] - vertices[i + 1]);
			let dz = Math.abs(vertices[i + 5] - vertices[i + 2]);
			let segmentLength = Math.sqrt(dx * dx + dy * dy + dz * dz);
			
			
			let remainder = segmentLength % height;

			if(segmentLength < height){
				if(remainder > 1){
					remainder = remainder/height;
				}
				lengthSum += remainder;
				u_list.push(lengthSum);
			}
			else if(segmentLength >= height){
				lengthSum += segmentLength/height;
				u_list.push(lengthSum);
			}			
		}
		
		return u_list;
	
		
	}

	normalizeArray(ls, v) {
		var len = ls.length;
		for (var i = 0; i < len; i++) {
			ls[i] /= v;
		}
		if (ls[len - 1] != 1) { ls.push(1);  }
		return ls;
	}

}

export class BoundaryVertexData {

	constructor(parameters) {
		parameters = parameters || {};

		if (parameters.boundary == undefined) {
			console.warn('there are some error in boundary .');
			return;
		}
		if (parameters.extrudeHeight == undefined) {
			console.warn('there are some error in extrudeHeight .');
			return;
		}

		const scope = this;

		var boundary = parameters.boundary;

		scope.vertexData = {}

		this.type = 'BoundaryVertexData';

		// extrude geo
		function extrudeGeo() {
			var uvGenerator1 = new uvGenerator();
			const indices = [];
			const vertices = [];
			const normals = [];
			const uvs = [], uvs2 = [];

			var polygon1 = boundary;
			var len = polygon1.length;

			for (let i = 0; i < len; i++) {
				vertices.push(polygon1[i][0][0]);
				vertices.push(polygon1[i][0][1]);
				vertices.push((polygon1[i][0][2]));
			}
			for (let i = 0; i < len; i++) {
				// P1= P + VectorUp* height;
				var excudePointx = polygon1[i][0][0] + polygon1[i][0][3] * parameters.extrudeHeight;
				var excudePointy = polygon1[i][0][1] + polygon1[i][0][4] * parameters.extrudeHeight;
				var excudePointz = polygon1[i][0][2] + polygon1[i][0][5] * parameters.extrudeHeight;
				vertices.push((excudePointx));
				vertices.push((excudePointy));
				vertices.push((excudePointz));
			}
			
			let StretchUv = uvGenerator1.InitUV2(vertices);
			let TileUv = uvGenerator1.InitUV(vertices, parameters.extrudeHeight);

			// Save the top 
			for (let i = 0; i < len; i++) {
				uvs.push(TileUv[i]);
				uvs.push(0);
				uvs2.push(StretchUv[i]);
				uvs2.push(0);
			}
			
			// Save the bottom
			for (let i = 0; i < len; i++) {
				uvs.push(TileUv[i]);
				uvs.push(1);
				uvs2.push(StretchUv[i]);
				uvs2.push(1);
			}

			// Calculated vectors and indexes
			for (let iy = 0; iy < 1; iy++) {
				var gridX1 = len;
				for (let ix = 0; ix < gridX1 - 1; ix++) {
					const a = ix + gridX1 * iy;
					const b = ix + gridX1 * (iy + 1);
					let c, d;

					c = (ix + 1) + gridX1 * (iy + 1);
					d = (ix + 1) + gridX1 * iy;

					var vector1 = MathUtils.createVec3();
					var vector2 = MathUtils.createVec3();
					MathUtils.vec3.set(vector1, vertices[b * 3] - vertices[a * 3], vertices[b * 3 + 1] - vertices[a * 3 + 1], vertices[b * 3 + 2] - vertices[a * 3 + 2]);
					MathUtils.vec3.set(vector2, vertices[d * 3] - vertices[a * 3], vertices[d * 3 + 1] - vertices[a * 3 + 1], vertices[d * 3 + 2] - vertices[a * 3 + 2]);
					MathUtils.vec3.normalize(vector1, vector1);
					MathUtils.vec3.normalize(vector2, vector2);
					let normalVec = MathUtils.createVec3();
					MathUtils.vec3.cross(normalVec, vector1, vector2);
					MathUtils.vec3.normalize(normalVec, normalVec);
					normals[a * 3] = normalVec[0];
					normals[a * 3 + 1] = normalVec[1];
					normals[a * 3 + 2] = normalVec[2];

					normals[b * 3] = normalVec[0];
					normals[b * 3 + 1] = normalVec[1];
					normals[b * 3 + 2] = normalVec[2];

					normals[d * 3] = normalVec[0];
					normals[d * 3 + 1] = normalVec[1];
					normals[d * 3 + 2] = normalVec[2];

					var vector3 = MathUtils.createVec3();
					var vector4 = MathUtils.createVec3();
					MathUtils.vec3.set(vector3, vertices[c * 3] - vertices[b * 3], vertices[c * 3 + 1] - vertices[b * 3 + 1], vertices[c * 3 + 2] - vertices[b * 3 + 2]);
					MathUtils.vec3.set(vector4, vertices[d * 3] - vertices[b * 3], vertices[d * 3 + 1] - vertices[b * 3 + 1], vertices[d * 3 + 2] - vertices[b * 3 + 2]);
					MathUtils.vec3.normalize(vector3, vector3);
					MathUtils.vec3.normalize(vector4, vector4);
					let normalVec2 = MathUtils.createVec3();
					MathUtils.vec3.cross(normalVec2, vector3, vector4);
					MathUtils.vec3.normalize(normalVec2, normalVec2);
					normals[c * 3] = normalVec2[0];
					normals[c * 3 + 1] = normalVec2[1];
					normals[c * 3 + 2] = normalVec2[2];

					indices.push(a, b, d);
					indices.push(b, c, d);
				}
			}
			
			scope.vertexData = {
				position: vertices,
				normal: normals,
				uv: uvs,
				uv2: uvs2,
				index: indices
			}
			
		}

		extrudeGeo();
	}

}

