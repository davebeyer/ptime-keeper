/// <reference path="../../typings/tsd.d.ts" />

class Timer {
    name         : string;
    timerId      : number;
    start_dt     : any;
    interval_ms  : number;
    subscriberCB : any;

    constructor(name:string, subCB:any, interval_ms?:number) {
	if (!interval_ms) {
	    interval_ms = 1000;   // 1 sec
	}

	this.name         = name;
	this.timerId      = null;
	this.start_dt     = null;
	this.subscriberCB = subCB;
	this.interval_ms  = interval_ms;
    }

    isRunning() {
	return (this.timerId !== null);
    }

    time_ms() {
	if (! this.isRunning() ) {
	    return null;
	} 
	var now_dt:any     = new Date();
	var diff_ms:number = now_dt - this.start_dt;
	return diff_ms;
    }

    start() {
	var _this = this;

	this.start_dt = new Date();

	this.timerId  = setInterval(function() {
	    if (_this.subscriberCB) {
		var diff_ms = _this.time_ms();
		console.log("Timer " + _this.name + " firing at " + diff_ms / 1000.0 + " secs");
		_this.subscriberCB('tick', diff_ms);
	    }
	}, this.interval_ms);
    }

    stop() {
	if (this.timerId) {
	    clearTimeout(this.timerId);
	    this.timerId = null;
	}
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
