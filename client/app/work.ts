/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, NgFor}              from 'angular2/angular2';
import {RouteParams, Router}                 from 'angular2/router';

import {ActivitiesService}    from '../services/activities';
import {RouterService}        from '../services/router';
import {TimerService, Timer}  from '../services/timer';
import {SettingsService}      from '../services/settings';

import {range}                from '../public/js/utils';

import {Sounds}               from '../components/sounds';

var moment = require('moment');

declare var jQuery:any;


@Component({
    selector:   'work-block'
})

@View({
    directives: [NgFor],

    styles: [
        ".abs-center           {position:absolute; left:0; right:0; margin:0 auto;}",
        ".abs-top              {position:absolute;  top:0;}",
        ".abs-top.left         {left:10px; right:auto; text-align:left;}",
        ".abs-top.right        {right:10px; left: auto; text-align:right;}",

        ".abs-bottom           {position:absolute;  bottom:0;}",
        ".abs-bottom.left      {left:20px; right: auto; text-align:left;}",
        ".abs-bottom.right     {right:20px; left: auto; text-align:right;}",

        ".info-row             {margin: 30px 0 0 0px; width: calc(100% - 10px); display:flex; align-items:center;}",
        ".act-title            {}",
        ".act-descr            {opacity : 0.6;}",

        ".timer-clock          {font-weight:bold; opacity:0.6}",
        ".timer-clock.active   {opacity: 1.0}",
        ".break-clock          {font-weight:bold; padding: 10px 20px}",
        ".timer-message        {font-weight:bold; width:50%;}",

        ".timer .btn           {background: transparent; border-width: 2px; transition: background .2s ease-in-out, border .2s ease-in-out;}",
        ".timer img.animated   {opacity : 0.6;}",
        ".timer img.animated.pulse {opacity : 1.0;}"  /* when timer is running */
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
                <span class="timer-clock" [style.font-size]="tmrFont" [style.color]="workTmrColor" [class.active]="workTmr.isRunning()">
                  {{workTmrDisp}}
                </span>
              </div>

              <div class="abs-center"  [style.bottom]="iconBottom" [hidden]="noActivity()">
                <span [hidden]="!workTmr.isRunning()">
                  <button (click)="pauseTimer()" class="btn btn-default" [style.font-size]="iconFont" style="padding:0 15px">
                    <i class="fa fa-pause"></i>
                  </button>
                </span>
                <span  [hidden]="workTmr.isRunning()">
                  <button (click)="startTimer()" class="btn btn-default" [style.font-size]="iconFont" style="padding:0 15px">
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
                  {{breakTmrDisp}}
                </span>
              </div>

              <div class="abs-bottom left" [hidden]="noActivity()">
                <img *ng-for="#i of leftPoms()" [style.opacity]="pomOpacity[i]" src="/img/tomato-xs.png"/>
              </div>
              <div class="abs-bottom right" [hidden]="noActivity()">
                <img *ng-for="#i of rightPoms()" [style.opacity]="pomOpacity[i+4]" src="/img/tomato-xs.png"/>
              </div>

            </div>
          </div>

          <div class="row info-row">
            <div class="col-xs-7 tight" [style.color]="actServ.workColor()" [hidden]="noActivity()">
              <span class="act-title" [style.font-size]="actFont">{{actServ.workCategory()}}:</span>
              <span class="act-descr" [style.font-size]="descFont">{{actServ.workDescription()}}</span>
            </div>
            <div class="col-xs-5 tight" [hidden]="noActivity()" style="white-space:nowrap; text-align:right;">
              <button class="done-btn btn btn-default"  [style.font-size]="descFont" [style.color]="actServ.workColor()" (click)="activityLater()" 
                title="Set aside to be finished later">
                <i class="fa fa-eject"></i> <!-- Later -->
              </button> &nbsp;
              <button class="done-btn btn btn-default"  [style.font-size]="descFont" [style.color]="actServ.workColor()" (click)="activityFinished()" 
                title="This activity has been completed!">
                <i class="fa fa-check"></i> <!-- Done -->
              </button>
            </div>
          </div>

        </div>
        `
})

export class Work {
    actServ    : ActivitiesService;
    router     : Router;
    routerServ : RouterService;
    timerServ  : TimerService;
    settings   : SettingsService;
    sounds     : Sounds;

    // CSS settings
    pomHeight  : any;
    pomWidth   : any;
    wrpHeight  : any;

    tmrBottom  : any;
    tmrFont    : any;
    iconBottom : any;
    iconFont   : any;
    descFont   : any;
    actFont    : any;

    // Timer vars
    workTmr       : Timer;
    workTmrDisp   : string;
    workTmrColor  : string;

    pomOpacity    : Array<number>;

    workPerPom_ms : number;

    breakTmr      : Timer;
    breakTmrDisp  : string;

    initState     : string;


    constructor(actServ    : ActivitiesService,
                router     : Router,
                routerServ : RouterService,
                timerServ  : TimerService,
                settings   : SettingsService,
                sounds     : Sounds, 
                params     : RouteParams) {
        console.log("work.ts: in constructor")

        this.actServ    = actServ;
        this.router     = router;
        this.routerServ = routerServ;
        this.timerServ  = timerServ;
        this.settings   = settings;
        this.sounds     = sounds;

        this.workTmrDisp  = '';
        this.workTmr      = null;

        this.breakTmrDisp = '';
        this.breakTmr     = null;

        this.pomOpacity = [];

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

        this.workTmr = this.timerServ.getTimer('work', {
            mode     : 'countdown',
            callback : function(type, time_ms) {
                if (type == 'alarm') {
                    _this.actServ.addActivityEvent('progress').then(function() {
                        _this.updateWorkTmrDisp(time_ms, {skipOpacity: false});
                    });

                    _this.sounds.play("break");
                } 
                
                // Immediately update time, whether or not updating opacity too
                _this.updateWorkTmrDisp(time_ms, {skipOpacity: true});
            }
        });

        this.breakTmr = this.timerServ.getTimer('break', {
            mode     : 'countdown',
            callback : function(type, time_ms) {
                if (type == 'alarm') {
                    _this.sounds.play("work")
                }

                _this.updateBreakTmrDisp(time_ms);
            }
        });

        // Reset timers when returning to this view, which means that the user
        // should finish their pomodoro before leaving view!
        this.workTmr.reset();
        this.breakTmr.reset();

        this.workPerPom_ms  = this.settings.getCachedSetting('work_mins') * 60 * 1000;

        this.breakTmr.fromTime_ms(this.settings.getCachedSetting('shortBreak_mins') * 60 * 1000);

        if (this.initState == 'start') {
            this.startTimer();
        } else if (this.isActivity()) {
            this.workTmr.fromTime_ms(this.workPeriod_ms());
            this.updateWorkTmrDisp();
        }

        this.routerServ.subscribe('work', function(url) {
            if (!url.toLowerCase().startsWith('work/') && url != 'work') {
                if (_this.breakTmr.isRunning() || _this.workTmr.isRunning()) {
                    _this.leaveActivity('later');
                } else {
                    _this.leaveActivity();
                }
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

    updateWorkTmrDisp(t_ms?:number, options?:any) {
        if (!options) { options = {}; }

        if (t_ms === undefined) {
            t_ms = this.workTmr.time_ms();
        }

        var disp = this.timerDisplay(t_ms);

        this.workTmrDisp  = disp['time'];
        this.workTmrColor = disp['color'];

        if (!options.skipOpacity) {
            this.updatePomOpacity();
        }
    }

    updateBreakTmrDisp(t_ms?:number) {
        if (t_ms === undefined) {
            t_ms = this.breakTmr.time_ms();
        }

        var disp = this.timerDisplay(t_ms);

        this.breakTmrDisp = disp['time'];
    }


    timerDisplay(time_ms:number) {
        var duration, neg;
        var colorVal, timeVal;

        // Round to nearest seconds (e.g., -5.6 => -6)
        time_ms = Math.floor((time_ms + 500) / 1000.0) * 1000;

        if (time_ms < 0) {
            duration  = moment.duration(-time_ms);
            colorVal = "#EEE";
            neg = "-";
        } else {
            duration  = moment.duration(time_ms);
            colorVal = "#444";
            neg = "";
        }
        
        timeVal = neg + moment.utc(duration.asMilliseconds()).format("mm:ss")

        return {time : timeVal, color : colorVal};
    }

    //
    // Start, restart, pause, finished
    //

    workPeriod_ms() {
        this.actServ.updateWorkActivity();
        var res_ms = this.actServ.timeRemaining_ms();

        if (res_ms < 0) {
            // already used all of the estimated time, so just set to another work period
            res_ms = this.workPerPom_ms; 
        } else {
            // Cap at one work period
            res_ms = Math.min(res_ms, this.workPerPom_ms);

            // Round up to nearest min
            res_ms = Math.floor (res_ms/60000.0 + 0.999999) * 60000;  // round up to nearest min
        }

        return res_ms;
    }

    startTimer() {
        var _this = this;

        if (this.workTmr.time_ms() < 0) {
            console.log("Resetting due to work time of", this.workTmr.time_ms());
            // If re-starting from a negative work timer, restart the timers 
            this.workTmr.reset();
            this.breakTmr.reset();
        }

        // Update work period in case there's less than one Pomodoro remaining
        this.workTmr.fromTime_ms(this.workPeriod_ms())

        this.workTmr.start();
        this.breakTmr.pause();

        this.actServ.addActivityEvent('start').then(function() {
            _this.updateWorkTmrDisp();
        });
    }

    pauseTimer() {
	var _this = this;

        // Get time before stopping timer
        var t_ms = this.workTmr.time_ms();

        this.workTmr.pause();
        this.breakTmr.start();

        if (this.isActivity()) {
            this.actServ.addActivityEvent('break').then(function() {
                _this.updateWorkTmrDisp(t_ms);
                _this.updateBreakTmrDisp();
            });
        }
    }

    leaveActivity(eventType?:string) {
        this.workTmr.stop();
        this.breakTmr.stop();
        if (eventType) {
            this.actServ.addActivityEvent(eventType);
        }
    }

    activityFinished() {
        var _this = this;

        this.leaveActivity('complete');
        this.sounds.play("completed")

        setTimeout(function() {
            _this.gotoPlan();
        }, 1700);  // time for sound to play
    }

    activityLater() {
        var _this = this;

        this.leaveActivity('later');

        setTimeout(function() {
            _this.gotoPlan();
        }, 700);
    }

    //
    // Pomodoro rendering
    //

    leftPoms() {
        var num = this.actServ.estNumPoms();
        if (num < 4) {
            return range(num);
        } else {
            return range(4);
        }
    }

    rightPoms() {
        var num = this.actServ.estNumPoms();
        if (num > 4) {
            return range(num - 4);
        } else {
            return [];
        }
    }

    updatePomOpacity() {
        this.actServ.updateWorkActivity();

        var onPomNum = this.actServ.workOnPomNum();
        var numPoms  = this.actServ.workEstNumPoms()
        var num, val;

        this.pomOpacity = [];

        for (num = 0; num < this.actServ.estNumPoms(); num++) {
            
            if (num < onPomNum)      { val = 0.4; }
            else                     { val = 1.0; }
            this.pomOpacity[num] = val;
        }
    }
}
