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
        ".timer-clock          {font-size:70px; font-weight:bold;}",
        ".play-icons           {text-align:right;}",
        ".info-row             {margin: 30px 0 0 10px; width: calc(100% - 10px); display:flex; align-items:center;}",
        ".act-title            {}",
        ".act-descr            {opacity : 0.6;}",
        ".timer .btn           {background: transparent; border-width: 2px; transition: background .2s ease-in-out, border .2s ease-in-out;}",
	".timer img            {opacity : 0.7;}",
	".timer img.pulse      {opacity : 1.0;}"  /* when timer is running */
    ],


    template: `
        <div class="container">
          <div class="row timer">
            <div class="col-xs-12 text-center" [style.height]="wrpHeight">
              <img class="abs-center animated"  [class.pulse]="timer" [style.height]="pomHeight" [style.width]="pomWidth"  
                   src="/img/tomato-lg.png"/>
              <div class="abs-center"  [style.bottom]="tmrBottom">
                <span class="timer-clock" [style.font-size]="tmrFont" [style.color]="tmrColor">
                  {{dispTime}}
                </span>
              </div>
              <div class="abs-center"  [style.bottom]="iconBottom">
                <span [hidden]="!timer">
                  <button (click)="pauseTimer($event)" class="btn btn-default" [style.font-size]="iconFont">
                    <i class="fa fa-pause"></i>
                  </button>
                </span>
                <span  [hidden]="timer">
                  <button (click)="restartTimer($event)" class="btn btn-default" [style.font-size]="iconFont">
                    <i class="fa fa-play"></i>
                  </button>
                </span>
              </div>
            </div>
          </div>

           <div class="row info-row">
            <div class="col-xs-8" [style.color]="actColor" >
              <span class="act-title" [style.font-size]="actFont">Math:</span>
              <span class="act-descr" [style.font-size]="descFont">Homework assignment, chapter 4.5 & 4.6</span>
            </div>
            <div class="col-xs-4 play-icons">
              <button class="btn btn-default"  [style.font-size]="actFont" [style.color]="actColor" (click)="activityFinished($event)">
                <i class="fa fa-check"></i> Done
              </button>
            </div>
          </div>

          <audio id="success-sound" preload="auto" src="audio/tada.mp3" type="audio/mp3"/>

        </div>
        `
})

export class Work {

    // CSS settings
    pomHeight  : any;
    pomWidth   : any;
    wrpHeight  : any;

    tmrColor   : string;

    tmrBottom  : any;
    tmrFont    : any;
    iconBottom : any;
    iconFont   : any;
    descFont   : any;
    actFont    : any;
    actColor   = "blue";

    // Timer vars
    dispTime   : string;
    startTime  : any;
    timer      : number;

    timeRem_ms = 20 * 1000; // 25 * 60 * 1000;  // 25 mins

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

	// Timer starts in paused state
	this.timerDisplay(this.timeRem_ms);
        this.timer = null;
    }

    resizeTimer() {
        var winHeight = jQuery(window).height();
        var winWidth  = jQuery(window).width();

        var heightMargin = 250;
        var widthMargin  = 80;

        var height;

        if (winHeight - heightMargin > winWidth - widthMargin) {
            height = Math.max(150, winWidth - widthMargin);
            this.pomWidth  = height + 'px'; // assumes square image
            this.pomHeight = 'auto';
        } else {
            height = Math.max(winHeight - heightMargin, 150);
            this.pomWidth   = 'auto';
            this.pomHeight  = height + 'px';
        }

        this.tmrFont    = Math.floor(height * .25  + 5);
        this.iconFont   = Math.floor(this.tmrFont * 0.45);
        this.actFont    = Math.max(15, Math.floor(this.iconFont * 0.65));
        this.descFont   = Math.floor(this.actFont  * 0.8);
        
        this.tmrBottom  = Math.floor(height * .35  - (this.tmrFont * .3)) + 'px';
        this.iconBottom = Math.floor(height * .35  - (this.tmrFont * .3 + this.iconFont + 15)) + 'px'

        this.tmrFont   += 'px';
        this.iconFont  += 'px';
        this.descFont  += 'px';
        this.actFont   += 'px';

        this.wrpHeight = height + 'px';

        console.log("New height", height);
    }

    pauseTimer($event) {
        $event.preventDefault();

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.updateDisplay();

        var now:any     = new Date();
        var diff:number = now - this.startTime;

        this.timeRem_ms -= diff;
    }

    restartTimer() {
        this.startTimer();
    }

    startTimer() {
        var _this = this;

        this.startTime = new Date();

        this.timer = setInterval(function() {
            _this.updateDisplay();
        }, 1000);

        this.updateDisplay();
    }

    updateDisplay() {
        var now:any     = new Date();
        var diff:number = now - this.startTime - 500; // 500ms rounding

	this.timerDisplay(this.timeRem_ms - diff);
    }

    timerDisplay(time_ms) {
        var duration, neg;

	// Next lower number of seconds (e.g., -5.6 => -6)
	time_ms = Math.floor(time_ms / 1000.0) * 1000;

        if (time_ms < 0) {
            duration  = moment.duration(-time_ms);
            this.tmrColor = "#EEE";
            neg = "-";
        } else {
            duration  = moment.duration(time_ms);
            this.tmrColor = "#444";
            neg = "";
        }
        
        this.dispTime = neg + moment.utc(duration.asMilliseconds()).format("mm:ss")
    }

    activityFinished($event) {
        $event.preventDefault();
        this.pauseTimer($event);
        jQuery("#success-sound")[0].play();
    }
}
