/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}                from 'angular2/angular2';
import {CanReuse, ComponentInstruction} from 'angular2/router';

@Component({
    selector: 'preferences-block'
})

@View({
    template: `
        <h1>Preferences</h1>
        `
})

export class Preferences implements CanReuse {

    constructor() {
        console.log("preferences.ts: in constructor")
    }

    canReuse(next: ComponentInstruction, prev: ComponentInstruction) {
	return true;
    }
}
