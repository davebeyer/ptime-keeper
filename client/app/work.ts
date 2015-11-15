/// <reference path="../../typings/tsd.d.ts" />

import {Component, View}                     from 'angular2/angular2';
import {RouteParams, Router}                 from 'angular2/router';

import {ActivitiesService}    from '../services/activities';
import {RouterService}        from '../services/router';
import {TimerService, Timer}  from '../services/timer';
import {SettingsService}      from '../services/settings';

var moment = require('moment');

declare var jQuery:any;


@Component({
    selector:   'work-block'
})

@View({
    styles: [
        ".abs-center           {position:absolute; left:0; right:0; margin:0 auto;}",
        ".abs-top              {position:absolute;  top:0;}",
        ".abs-top.left         {left:20px; right:auto; text-align:left;}",
        ".abs-top.right        {right:20px; left: auto; text-align:right;}",

        ".info-row             {margin: 30px 0 0 10px; width: calc(100% - 10px); display:flex; align-items:center;}",
        ".act-title            {}",
        ".act-descr            {opacity : 0.6;}",

        ".timer-clock          {font-weight:bold;}",
        ".break-clock          {font-weight:bold; padding: 10px 20px;}",
        ".timer-message        {font-weight:bold; width:50%;}",

        ".timer .btn           {background: transparent; border-width: 2px; transition: background .2s ease-in-out, border .2s ease-in-out;}",
        ".timer img            {opacity : 0.6;}",
        ".timer img.pulse      {opacity : 1.0;}"  /* when timer is running */
    ],


    template: `
        <div class="container">
          <div class="row timer">
            <div class="col-xs-12 text-center" [style.height]="wrpHeight">
              <img class="abs-center animated"  [class.pulse]="workTmr.isRunning()" [style.height]="pomHeight" [style.width]="pomWidth"  
                   src="/img/tomato-lg.png"/>

              <div class="abs-center timer-message" [hidden]="!noActivity()"
                   [style.font-size]="actFont" [style.bottom]="tmrBottom">
                Go to the <a href="#" (click)="gotoPlan()">Plan </a> page <br/>
                to select an activity<br/>
                to work on.
              </div>

              <div class="abs-center"  [style.bottom]="tmrBottom" [hidden]="noActivity()">
                <span class="timer-clock" [style.font-size]="tmrFont" [style.color]="tmrColor">
                  {{dispTime}}
                </span>
              </div>

              <div class="abs-center"  [style.bottom]="iconBottom" [hidden]="noActivity()">
                <span [hidden]="!workTmr.isRunning()">
                  <button (click)="pauseTimer()" class="btn btn-default" [style.font-size]="iconFont" style="padding:0 15px">
                    <i class="fa fa-pause"></i>
                  </button>
                </span>
                <span  [hidden]="workTmr.isRunning()">
                  <button (click)="restartTimer($event)" class="btn btn-default" [style.font-size]="iconFont" style="padding:0 15px">
                    <i class="fa fa-play"></i>
                  </button>
                </span>
              </div>

              <div class="abs-top left" [hidden]="!breakTmr.isRunning()">
                <span class="break-clock"  [style.font-size]="iconFont">
                  Break
                </span>
              </div>

              <div class="abs-top right" [hidden]="!breakTmr.isRunning()">
                <span class="break-clock" [style.font-size]="iconFont">
                  {{dispBreak}}
                </span>
              </div>

            </div>
          </div>

          <div class="row info-row">
            <div class="col-xs-7 tight" [style.color]="actServ.workColor()" [hidden]="noActivity()">
              <span class="act-title" [style.font-size]="actFont">{{actServ.workCategory()}}:</span>
              <span class="act-descr" [style.font-size]="descFont">{{actServ.workDescription()}}</span>
            </div>
            <div class="col-xs-5 tight" [hidden]="noActivity()" style="white-space:nowrap">
              <button class="done-btn btn btn-default"  [style.font-size]="descFont" [style.color]="actServ.workColor()" (click)="activityLater()" 
                title="Set aside to be finished later">
                <i class="fa fa-eject"></i> Later
              </button> &nbsp;
              <button class="done-btn btn btn-default"  [style.font-size]="descFont" [style.color]="actServ.workColor()" (click)="activityFinished()" 
                title="This activity has been completed!">
                <i class="fa fa-check"></i> Done
              </button>
            </div>
          </div>

          <audio id="success-sound" preload="auto" src="audio/completed1.mp3" type="audio/mp3"/>

        </div>
        `
})

export class Work {
    actServ    : ActivitiesService;
    router     : Router;
    routerServ : RouterService;
    timerServ  : TimerService;
    settings   : SettingsService;

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

    // Timer vars
    workTmr    : Timer;
    dispTime   : string;
    timeRem_ms : number;

    breakTmr    : Timer;
    breakRem_ms : number;
    dispBreak   : string;

    initState  : string;


    constructor(actServ    : ActivitiesService,
                router     : Router,
		routerServ : RouterService,
		timerServ  : TimerService,
                settings   : SettingsService,
                params     : RouteParams) {
        console.log("work.ts: in constructor")

        this.actServ    = actServ;
        this.router     = router;
	this.routerServ = routerServ;
	this.timerServ  = timerServ;
	this.settings   = settings;

        this.dispTime   = '';
        this.workTmr      = null;

        this.dispBreak    = '';
        this.breakTmr     = null;

        this.resizeTimer();

        this.initState = params.get('state');
    }

    onInit() {
        var _this = this;

        // Couldn't get Directive / hostListeners to work with 
        // window:resize event, so using jQuery for now
        jQuery(window).on('resize', function() {
            _this.resizeTimer();
        });

	// Add tooltips for all titled elements
        jQuery("[title]").tooltip({placement: 'top', delay : 500});

	this.workTmr = this.timerServ.getTimer('work', function(type, time_ms) {
	    _this.updateDisplay(time_ms);
	});

	this.breakTmr = this.timerServ.getTimer('break', function(type, time_ms) {
	    _this.updateBreakDisplay(time_ms);
	});

	this.breakRem_ms = this.settings.getCachedSetting('shortBreak_mins') * 60 * 1000;

        if (this.initState == 'start') {
            this.startTimer();
        } else if (this.isActivity()) {
	    this.timeRem_ms = this.actServ.timeRemaining_ms(); // + 500; // 500ms for rounding
            this.dispTime = this.timerDisplay(this.timeRem_ms);
	}

        this.routerServ.subscribe('work', function(url) {
            if (!url.toLowerCase().startsWith('work/') && url != 'work') {
		_this.pauseTimer({notABreak : true});
		_this.breakTmr.pause();
            }
            console.log("In Work: router navigating to", url);
        });
    }

    noActivity() {
        return (this.actServ.workActivity === null);
    }

    isActivity() {
        return (this.actServ.workActivity !== null);
    }

    gotoPlan() {
        this.router.navigate(['/Plan']);
    }

    //
    // Timer display
    //

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

    updateDisplay(diff_ms?:number) {
	if (diff_ms === undefined) {
	    diff_ms = this.workTmr.time_ms();
	}
        this.dispTime = this.timerDisplay(this.timeRem_ms - diff_ms);
    }

    updateBreakDisplay(diff_ms?:number) {
	if (diff_ms === undefined) {
	    diff_ms = this.breakTmr.time_ms();
	}
        this.dispBreak = this.timerDisplay(this.breakRem_ms - diff_ms);
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
        
        return neg + moment.utc(duration.asMilliseconds()).format("mm:ss")
    }

    //
    // Start, restart, pause, finished
    //

    startTimer() {
        var _this = this;

	this.timeRem_ms = this.actServ.timeRemaining_ms(); // + 500;  // 500ms for rounding

	this.workTmr.start();
	this.breakTmr.pause();

        this.updateDisplay();
        this.actServ.addActivityEvent('start');
    }

    restartTimer() {
        this.startTimer();
    }

    pauseTimer(options?) {
        if (!options) { options = {}; }

	// Get time before stopping timer
	var diff_ms = this.workTmr.time_ms();

	this.workTmr.stop();
	if (!options.notABreak) {
	    this.breakTmr.start();
	    this.updateBreakDisplay();
	}

        this.updateDisplay(diff_ms);

        this.timeRem_ms -= diff_ms;

        if (!options.skipEvent && this.isActivity()) {
            this.actServ.addActivityEvent('break');
        }
    }

    activityFinished() {
	var _this = this;

        this.pauseTimer({skipEvent : true, notABreak : true});
        this.actServ.addActivityEvent('complete');
        jQuery("#success-sound")[0].play();

	setTimeout(function() {
	    _this.gotoPlan();
	}, 1700);  // time for sound to play
    }

    activityLater() {
	var _this = this;

        this.pauseTimer({skipEvent : true, notABreak : true});
	this.breakTmr.stop();
        this.actServ.addActivityEvent('later');

	setTimeout(function() {
	    _this.gotoPlan();
	}, 700);
    }
}
