/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}          from 'angular2/angular2';

declare var jQuery:any;

@Component({
    selector: 'sounds'
})

@View({
    template: `
          <audio id="completed-sound" preload="auto" src="audio/completed1.mp3" type="audio/mp3"/>
          <audio id="work-sound"      preload="auto" src="audio/work1.mp3"      type="audio/mp3"/>
          <audio id="break-sound"     preload="auto" src="audio/break1.mp3"     type="audio/mp3"/>
	`
})

export class Sounds {

    constructor() {
	console.log("sounds constructor");
    }

    play(name) {
        jQuery("#" + name + "-sound")[0].play();
    }
}
