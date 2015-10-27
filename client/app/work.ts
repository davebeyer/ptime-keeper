/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}                from 'angular2/angular2';
import {CanReuse, ComponentInstruction} from 'angular2/router';

declare var jQuery:any;

@Component({
    selector: 'work-block'
})

@View({
    template: `
        <h1> Work!</h1>
        `
})

export class Work implements CanReuse {

    constructor() {
        console.log("work.ts: in constructor")
    }

    canReuse(next: ComponentInstruction, prev: ComponentInstruction) {
	return true;
    }
}
