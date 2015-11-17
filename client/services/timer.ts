/// <reference path="../../typings/tsd.d.ts" />

export class Timer {
    name         : string;
    options      : any;

    timerId      : number;
    start_dt     : any;
    accum_ms     : number;
    prevTick_ms  : number;

    constructor(name:string, options) {
        this.name         = name;
        this.timerId      = null;

        this.reset();

        this.options = { 
            mode        : 'countup',
            callback    : null,
            interval_ms : 1000, // 1 sec
            fromTime_ms : 0   // used for 'countdown' timers
        }

        this.updateOptions(options);

    }

    /**
     * For 'countdown' timers, sets the time used to count down from, in msecs
     */

    fromTime_ms(t_ms) {
        this.updateOptions({fromTime_ms : t_ms});
    }

    updateOptions(options) {
        if (!options) { options = {}; }
        
        var keys = Object.keys(options);
        var key;

        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            if (! (key in this.options) ) {
                console.error("Invalid Timer option: ", key, options[key]);
            } else {
                this.options[key] = options[key];  // overwrite default
            }
        }
    }

    isRunning() {
        return (this.timerId !== null);
    }

    time_ms(options?:any) {
        if (!options) { options = {}; }

        var diff_ms;

        if (this.isRunning() ) {
            var stop_dt:any = new Date();
            diff_ms = stop_dt - this.start_dt;
        }  else {
            diff_ms = 0;
        }

        if (!options.ignoreAccum) {
            diff_ms += this.accum_ms;
        }

        if (this.options.mode == 'countdown') {
            return this.options.fromTime_ms - diff_ms;
        } else {
            return diff_ms;
        }
    }

    /**
     * Restart the timer, but maintain accumulated running time if any
     */

    restart() {
        this.start({restart : true});
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

        this.start_dt     = new Date();
        this.prevTick_ms  = -1;

        if (this.timerId) {
            clearTimeout(this.timerId);
        }

        this.timerId  = setInterval(function() {
            if (_this.options.callback) {
                var t_ms = _this.time_ms();
                // console.log('"' + _this.name + '" timer firing at ' + t_ms / 1000.0 + ' secs');
                try {
                    if (t_ms <= 0 && this.prevTick_ms > 0) {
                        _this.options.callback('alarm', t_ms);
                    } else {
                        _this.options.callback('tick', t_ms);
                    }
                } catch (err) {
                    console.error("Timer: callback failed", err, _this);
                }
                this.prevTick_ms  = t_ms;
            }
        }, this.options.interval_ms);
    }

    pause() {
        if (this.timerId) {
            var stop_dt:any = new Date();
            this.accum_ms += stop_dt - this.start_dt;

            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }

    stop() {
        this.pause();
        this.accum_ms     = 0;
        this.start_dt     = null;
        this.prevTick_ms  = -1;
    }
    
    reset() {
        this.stop();
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
     * 
     * Options: 
     *   mode:        'countdown' (dflt), 'countup'
     *   callback:    subscriber callback
     *   interval_ms: callback interval in msecs
     */
    getTimer(name:string, options) {
        if (! (name in this.timers)) {
            this.timers[name] = new Timer(name, options);
        } else {
            this.timers[name].updateOptions(options);
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
