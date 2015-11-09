/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}                from 'angular2/angular2';
import {CanReuse, ComponentInstruction} from 'angular2/router';

declare var jQuery:any;

@Component({
    selector: 'work-block'
})

@View({
    template: `
	<h2 class="page-title">Work session!</h2>
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
