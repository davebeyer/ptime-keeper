/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}                from 'angular2/angular2';
import {CanReuse, ComponentInstruction} from 'angular2/router';

declare var jQuery:any;

@Component({
    selector: 'review-block'
})

@View({
    template: `
        <div class="container">
          <h2 class="page-title">My work history</h2>
          <h3 class="page-title">... coming soon, stay tuned!</h3>
        </div>
        `
})

export class Review implements CanReuse {

    constructor() {
        console.log("review.ts: in constructor")
    }

    canReuse(next: ComponentInstruction, prev: ComponentInstruction) {
	return true;
    }
}
