import { BaseComponent, } from '../libs/thing.module.js';
    
class BoundaryComponent extends BaseComponent {

    /**
     * constructor
     */
	constructor(param = {}) {
		super(param);
        
    }

    onAdd(object) {
		super.onAdd(object);
    }

    onRemove() {

        super.onRemove();
    }

    onUpdate() {

    }
}
export { BoundaryComponent } 