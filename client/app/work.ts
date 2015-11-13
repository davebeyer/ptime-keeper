/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, Directive, HostListener}  from 'angular2/angular2';

var moment = require('moment');

declare var jQuery:any;


@Component({
    selector: 'work-block'
})

@View({
    styles: [
        ".abs-center           {position:absolute; left:0; right:0; margin:0 auto;}",
	".timer-clock          {font-size:70px; font-weight:bold;}"
    ],

    template: `
        <div class="container">
          <h2 class="page-title">Work time!</h2>

          <div class="row">
            <div class="col-xs-12 text-center" [style.height]="wrpHeight">
              <img class="abs-center"  [style.height]="pomHeight" [style.width]="pomWidth"  
                   src="/img/tomato-lg.png"/>
	      <div class="abs-center"  [style.bottom]="tmrBottom">
                <span class="timer-clock" [style.font-size]="tmrFont" [style.color]="tmrColor">
                  {{dispTime}}
                </span>
	      </div>
            </div>
          </div>
        </div>
        `
})

export class Work {

    // CSS settings
    pomHeight : any;
    pomWidth  : any;
    wrpHeight : any;
    tmrBottom : any;
    tmrFont   : any;
    tmrColor  : string;

    // Timer vars
    dispTime  : string;
    startTime : any;
    timer     : number;
    totalTime = 20 * 1000; // 25 * 60 * 1000;  // 25 mins

    constructor() {
        console.log("work.ts: in constructor")

	this.startTime = null;
	this.dispTime  = '';
	this.timer     = null;

	this.resizeTimer();
    }

    onInit() {
	var _this = this;

	// Couldn't get Directive / hostListeners to work with 
	// window:resize event, so using jQuery for now
	jQuery(window).on('resize', function() {
	    _this.resizeTimer();
	});

	this.startTimer();
    }

    resizeTimer() {
        var winHeight = jQuery(window).height();
        var winWidth  = jQuery(window).width();

        var heightMargin = 200;
        var widthMargin  = 80;

        var height;

        if (winHeight - heightMargin > winWidth - widthMargin) {
            height = winWidth - widthMargin;
            this.pomWidth  = height + 'px'; // assumes square image
            this.pomHeight = 'auto';
        } else {
            height = winHeight - heightMargin;
            this.pomWidth   = 'auto';
            this.pomHeight  = height + 'px';
        }

	this.tmrFont   = Math.floor(height * .25  + 5);
        this.tmrBottom = Math.floor(height * .35  - (this.tmrFont/2.0)) + 'px'
	this.tmrFont  += 'px';

        this.wrpHeight = height + 'px';

	console.log("New height", height);
    }

    startTimer() {
	var _this = this;

	this.startTime = new Date();
	this.updateDisplay();

	this.timer = setInterval(function() {
	    _this.updateDisplay();
	}, 1000);
    }

    updateDisplay() {
	var duration, neg;
	var now:any     = new Date();
	var diff:number = now - this.startTime;

	if (diff > this.totalTime) {
	    duration  = moment.duration(diff - this.totalTime);
	    this.tmrColor = "#EEE";
	    neg = "-";
	} else {
	    duration  = moment.duration(this.totalTime - diff);
	    this.tmrColor = "#444";
	    neg = "";
	}
	
	this.dispTime = neg + moment.utc(duration.asMilliseconds()).format("mm:ss")
    }

}
