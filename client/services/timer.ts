/// <reference path="../../typings/tsd.d.ts" />

export class Timer {
    name         : string;
    timerId      : number;
    start_dt     : any;
    stop_dt      : any;
    accum_ms     : number;
    interval_ms  : number;
    subscriberCB : any;

    constructor(name:string, subCB:any, interval_ms?:number) {
	if (!interval_ms) {
	    interval_ms = 1000;   // 1 sec
	}

	this.name         = name;
	this.timerId      = null;

	this.start_dt     = null;
	this.stop_dt      = null;
	this.accum_ms     = 0;

	this.subscriberCB = subCB;
	this.interval_ms  = interval_ms;
    }

    updateSubscriber(subCB:any, interval_ms?:number) {
        this.subscriberCB = subCB;

        if (interval_ms) {
            this.interval_ms = interval_ms;
        }
    }

    isRunning() {
	return (this.timerId !== null);
    }

    time_ms(options?:any) {
	if (!options) { options = {}; }

	var stop_dt;
	if (! this.isRunning() ) {
	    if (this.stop_dt !== null) {
		stop_dt = this.stop_dt;
	    } else {
		return null;
	    }
	}  else {
	    stop_dt = new Date();
	}

	var diff_ms = stop_dt - this.start_dt;
	if (options.ignoreAccum) {
	    return diff_ms;
	} else {
	    return diff_ms + this.accum_ms;
	}
    }

    start(options?:any) {
	if (!options) { options = {}; }

	if (this.isRunning()) {
	    if (!options.restart) {
		// Already running and restart option wasn't specified
		return;
	    }
	}

	var _this = this;

	this.start_dt = new Date();
	this.stop_dt  = null;

	if (this.timerId) {
	    clearTimeout(this.timerId);
	}

	this.timerId  = setInterval(function() {
	    if (_this.subscriberCB) {
		var diff_ms = _this.time_ms();
		// console.log('"' + _this.name + '" timer firing at ' + diff_ms / 1000.0 + ' secs');
		try {
		    _this.subscriberCB('tick', diff_ms);
		} catch (err) {
		    console.error("Timer: callback failed", _this);
		}
	    }
	}, this.interval_ms);
    }

    pause() {
	if (this.timerId) {
	    this.accum_ms += this.time_ms({ignoreAccum : true});

	    clearTimeout(this.timerId);
	    this.stop_dt = new Date();
	    this.timerId = null;
	}
    }

    stop() {
	this.pause();
	this.accum_ms = 0;
    }
}

/**
 * TimerService
 *
 * Because Services are singletons that persist view changes, etc., 
 * the TimerService allows maintenance & management of persistent timers.
 */
export class TimerService {

    timers : {};   // {}<Timer>;

    constructor() {
        console.log("timer.ts: in TimerService constructor");
	this.timers = {};
    }

    /**
     * Returns the named timer, creating one if needed.
     */
    getTimer(name:string, subCB: any, interval_ms?: number) {
	if (! (name in this.timers)) {
	    this.timers[name] = new Timer(name, subCB, interval_ms);
	} else {
	    this.timers[name].updateSubscriber(subCB);
	}
	return this.timers[name];
    }

    hasTimer(name:string) {
	return (name in this.timers);
    }

    delTimer(name:string) {
	if (name in this.timers) {
	    this.timers[name].stop();
	    delete this.timers[name];
	}
    }
}
