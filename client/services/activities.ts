/// <reference path="../../typings/tsd.d.ts" />

// @Inject needed for Services to support dependency injection
import {Inject} from 'angular2/core';

import {FirebaseService}   from './firebase';
import {UserService}       from './user';
import {SettingsService}   from '../services/settings';
import {SaveMsg}           from '../components/savemsg';

import {range}             from '../public/js/utils';

var moment = require('moment');

declare var jQuery:any;

export class ActivitiesService {
    NullCategory     = {name : '', color : 'transparent'};
    categoryColors   = ['Black', 'Blue', 'Brown' /*,'Cyan'*/, 'Gold', 'Grey', 'Green' /*,'Lime'*/, 'Maroon', 'Orange' /*,'Pink'*/, 'Purple', 'Red' /*,'Yellow'*/];

    fBase            : FirebaseService;
    userServ         : UserService;
    settings         : SettingsService;
    saveMsg          : SaveMsg;

    categories       : Array<any>;
    categoryDict     : any;

    plan             : any;
    planDate         : string;
    planTime         : string;

    _notifyInit      : any;

    activities       : Array<any>;
    activityDict     : any;

    workActivity     : any;  // current work activity

    constructor(@Inject(FirebaseService) fBase    : FirebaseService,
                @Inject(UserService)     userServ : UserService,
                @Inject(SettingsService) settings : SettingsService,
                @Inject(SaveMsg)         saveMsg  : SaveMsg) {
        var _this = this;
        console.log("activities.ts: in ActivitiesService constructor")

        this.userServ   = userServ;
        this.fBase      = fBase;
        this.settings   = settings;

        this.saveMsg    = saveMsg;

        this.resetPlan();

        this.categories       = [];
        this.categoryDict     = {};

        this._notifyInit      = null;

        // Register with the authentication callback
        this.userServ.loginNotify(function() {
            _this.settings.updateCachedSettings().then(function() {
                return _this.getCategories();
            }).then(function() {
                return _this.getCurrentPlan();
            }).then(function() {
                if (_this._notifyInit) {
                    _this._notifyInit();
                }
            });
        });

        this.clearWorkActivity();
    }

    /**
     * Allows registering a function to be called when this service completes initialization.
     */

    notifyInit(cb : any) {
        // TODO: consider a list of callbacks
        this._notifyInit = cb;
    }

    //
    // Current work activity 
    //

    setWorkActivity(activity) {
        this.workActivity = activity;
    }

    clearWorkActivity(activity?) {
        if (this.workActivity !== null) {
            if (!activity || (this.workActivity['created'] == activity['created'])) {
                this.workActivity = null;
            }
        }
    }

    updateWorkActivity() {
	if (this.workActivity) {
	    this.updateActivity(this.workActivity);
	}
    }

    addActivityEvent(eventType:string, activityId?:string) {
        var _this = this;

        return new Promise(function(resolve, reject) {
            eventType = eventType.toLowerCase();

            if (['start', 'break', 'progress', 'later', 'complete'].indexOf(eventType) == -1) {
                console.error("Invalid event type for addActivityEvent", eventType);
                reject("Invalid event type: " + eventType);
                return;
            }

            var activity = _this.getActivity(activityId);

            if (!activity) {
                console.error("addActivityEvent with no active workActivity");
                reject("No active work activity");
                return;
            }

            activityId = activity['created'];

            var created  = _this.fBase.dateToKey(new Date());

            var newEvent = {
                created    : created,
                type       : eventType
            };

            var path = 'activities/' + activityId + '/events/' + created;

            _this.userServ.updateUserData(newEvent, path).then(function() {
                // _this.saveMsg.flashMsg();
                _this.trackActivityEvent(activityId, newEvent);
                resolve();
            });
        });
    }

    workCategory() {
        if (!this.workActivity) { 
            return '';
        }

        return this.categoryName(this.workActivity.category);
    }

    workDescription() {
        if (!this.workActivity) { 
            return '';
        }
        return this.workActivity.description;
    }

    workEstimated_ms() {
        if (!this.workActivity) { 
            return 0;
        }
        return this.workActivity.estimated_mins * 60 * 1000;
    }

    workColor() {
        if (!this.workActivity) { 
            return 'black';
        }

        return this.categoryColor(this.workActivity.category);
    }

    workOnPomNum() {
        if (!this.workActivity) { 
            return 0;
        }

        return this.workActivity['onPomNum'];
    }

    workEstNumPoms() {
        if (!this.workActivity) { 
            return 0;
        }

        return this.workActivity['estNumPoms'];
    }

    getActivity(activityId?:string) {
        var res;
        if (activityId) {
            res = this.activityDict[activityId];
        } else {
            res = this.workActivity;
        }

        if (!res) {
            console.error("getActivity, no activity found", activityId);
        }

        return res;
    }

    //
    // Activity progess status
    //

    /**
     * Return events list, sorted by createdDate
     */
    getEvents(activity: any) {
        if (! ('events' in activity)) {
            return [];
        } 

        var eventIds = Object.keys(activity['events']);
        var events   = [];

        for (var i = 0; i < eventIds.length; i++) {
            events.push(activity['events'][eventIds[i]]);
        }

        events.sort(this.sortEvents.bind(this));

        return events;
    }

    sortEvents(a, b) {
        if (a['created'] < b['created']) {
            return -1;
        } else {
            return 1;
        }
    }

    isComplete(activityId? : string) {
        var activity = this.getActivity(activityId);
        if (!activity) {
            return false;
        }

        var events = this.getEvents(activity);

        var completed = false;

        for (var i = 0; i < events.length; i++) {
            switch(events[i].type) {
            case 'start':
                completed = false;   // even if restarted after a complete
                break;
            case 'complete':
                completed = true;
                break;
            default:
            }
        }

        return completed;
    }

    pomRange(activity?:any) {
        return range(this.estNumPoms(activity));
    }

    estNumPoms(activity?:any) {
        if (!activity) {
            activity = this.workActivity;
        }
        if (!activity) {
            return 0;
        }

        var est_mins     = activity.estimated_mins;
        var pomTime_mins = parseInt(this.settings.getCachedSetting('work_mins'));

        return Math.floor( (est_mins / pomTime_mins) + 0.5);
    }

    onPomNum(activity?:any) {
        if (!activity) {
            activity = this.workActivity;
        }
        if (!activity) {
            return 0;
        }

        var estimated_ms = activity.estimated_mins * 60 * 1000;
        var worked_ms    = this.timeWorked_ms(activity['created']);
        var numPoms      = this.estNumPoms(activity);

        var res = Math.floor( (worked_ms / estimated_ms ) * numPoms )

        return Math.min(res, numPoms);
    }

    /**
     * Compute estimated time remaining on this activity, in msecs
     */

    timeRemaining_ms(activityId? : string) {
        var activity = this.getActivity(activityId);
        if (!activity) {
            return 0;
        }

        var work_ms      = this.timeWorked_ms(activityId);

        var estimated_ms = activity.estimated_mins * 60 * 1000;
        
        return estimated_ms - work_ms;
    }

    /**
     * Compute time worked on this activity, in msecs
     */

    timeWorked_ms(activityId? : string) {
        var activity = this.getActivity(activityId);
        if (!activity) {
            return 0;
        }

        var events   = this.getEvents(activity);

        var work_ms  = 0;
        var start_dt = null;
        var end_dt   = null;
        var diff;

        for (var i = 0; i < events.length; i++) {
            switch(events[i].type) {
            case 'start':
                start_dt = this.fBase.keyToDate(events[i]['created']);
                break;
            case 'break':
            case 'progress':
            case 'later':
            case 'complete':
                if (start_dt !== null) {
                    end_dt   = this.fBase.keyToDate(events[i]['created']);
                    diff     = end_dt - start_dt;
                    work_ms += diff;
                    start_dt = null;
                }
                break;
            default:
                console.error("Invalid event type in timeRemaining_ms()", activityId, events[i].type);
            }
        }

        return work_ms;
    }

    //
    // Activity categories
    //

    hasCategories() {
        return (this.categories && this.categories.length > 0);
    }

    getCategories() {
        var _this = this;

        this.categories   = [];
        this.categoryDict = {};

        return new Promise(function(resolve, reject) {
            _this.userServ.getUserData('categories').then(function(value) {
                if (value) {
                    var keys = Object.keys(value);
                    for (var i = 0; i < keys.length; i++) {
                        _this.trackCategory(keys[i], value[keys[i]]);
                    }
                    _this.categories.sort(_this.sortCategories.bind(_this));
                }
                resolve(_this.categories);
            });
        });
    }

    sortCategories(a, b) {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
        } else {
            return 1;
        }
    }

    trackCategory(id, info) {
        info['id'] = id;
        this.categories.push(info);
        this.categoryDict[id] = info;
    }

    categoryName(catId) {
        var catInfo = this.categoryDict[catId];
        return catInfo ? catInfo.name : catId;
    }

    categoryColor(catId) {
        var catInfo = this.categoryDict[catId];
        return catInfo ? catInfo.color : 'black';
    }

    categoryInfo(catId) {
        if (catId in this.categoryDict) {
            return this.categoryDict[catId];
        } else {
            return this.NullCategory;
        }
    }

    addCategory(catEntry) {
        var _this = this;

        catEntry['created'] = new Date();

        var newCat = {};
        var id     = this.nameToCategoryId(catEntry.name);
        newCat[id] = catEntry;

        console.log("Adding category", newCat);

        return new Promise(function(resolve, reject) {
            _this.userServ.updateUserData(newCat, 'categories').then(function() {
                // Add category to our list
                _this.trackCategory(id, catEntry);
                _this.categories.sort(_this.sortCategories.bind(_this));

                // Flash 'saved' and return to Planning view
                _this.saveMsg.flashMsg();

                resolve(newCat);
            });
        });
    }
    
    nameToCategoryId(name : string) {
        var id = this.fBase.stringToKey(name);
        if (!id) {
            return id;
        } else {
            return id.toLowerCase();
        }
    }

    //
    // Plan handling
    //

    resetPlan() {
        this.plan       = null;
        this.planDate   = '';
        this.planTime   = '';

        this.activities   = [];
        this.activityDict = {};
    }

    startNewPlan() {
        this.resetPlan();
    }

    initPlan(plan, planId) {
        var _this = this;

        this.plan            = plan
        this.plan['created'] = planId     // convenience

        var planDT       = this.fBase.keyToDate(planId);
        var momDT        = moment(planDT);

        this.planDate    = momDT.format("ddd, DMMMYY");
        this.planTime    = momDT.format("h:mma");
    }

    getCurrentPlan() {
        var _this = this;

        return new Promise(function(resolve, reject) {
            _this.userServ.getUserData('plans', {limitToLast : true}).then(function(value) {
                if (!value) {
                    _this.plan         = null;
                    _this.activities   = [];
                    _this.activityDict = {};
                    resolve(_this.plan);
                } else {
                    var planId = Object.keys(value)[0];  // should only be one key

                    _this.initPlan(value[planId], planId);

                    // NOTE: Alternatively could iterate to get activities listed in 
                    //       plan.activities.

                    _this.userServ.getUserActivitiesForPlan(planId).then(function(value) {
                        if (value) {
                            _this.activities   = [];
                            _this.activityDict = {};

                            var activity;
                            var ids = Object.keys(value);

                            for (var i=0; i < ids.length; i++) {
                                _this.trackActivity(ids[i], value[ids[i]]);
                            }
                            _this.activities.sort(_this.sortActivities.bind(_this));
                            console.log("getCurrentActivities: current activities: ", _this.activities);
                        } else {
                            // If there are no activities associated with this play, 
                            // then reset plan to null.
                            //
                            // Could also consider deleting this plan, but leave it in place
                            // for now in case something weird is happening with DB.

                            _this.plan = null;
                        }
                        resolve(_this.plan);
                    });
                }
            });
        });
    }

    //
    // Activities handling
    //

    trackActivity(id, info) {
        if ( !(id in this.activityDict) ) {
            this.activities.push(info);        
            this.activityDict[id] = info;
        }

	this.updateActivity(info);
    }

    /**
     * Update calculated data for this activity, such as Pomodoros-completed status
     */ 

    updateActivity(activity) {
        activity['onPomNum']   = this.onPomNum(activity);
        activity['estNumPoms'] = this.estNumPoms(activity);
    }

    trackActivityEvent(activityId, newEvent) {
        var activity = this.activityDict[activityId];
        if (!activity) {
            console.error("Invalid activityId in trackActivityEvent!?", activityId);
        } else {
            var eventId = newEvent['created'];
            if (! ('events' in activity)) {
                activity['events'] = {};
            }
            activity['events'][eventId] = newEvent;
        }
    }

    hasActivities() {
        return (this.activities && this.activities.length > 0);
    }

    sortActivities(a, b) {
        var name1 = this.categoryName(a.category).toLowerCase();
        var name2 = this.categoryName(b.category).toLowerCase();
        if (name1 < name2) {
            return -1;
        } else if (name2 < name1) {
            return 1;
        } else if (a.created < b.created) {
            return -1;
        } else {
            return 1;
        }
    }

    addActivity(values) {
        // descr & poms
        var _this = this;

        var created      = this.fBase.dateToKey(new Date());
        var pomTime_mins = parseInt(this.settings.getCachedSetting('work_mins'));

        var newActivity = {
            created        : created,
            category       : values.categoryId,
            description    : values.description,
            estimated_mins : values.pomodoros * pomTime_mins
        }

        if (this.plan == null) {
            // later, allow possibility of naming plans
            this.initPlan({name : created}, created);
        } 

        if (!this.plan['activities']) {
            this.plan['activities'] = {};
        }

        // created is the activityId of this new activity
        this.plan['activities'][created] = "1"

        var planId = this.plan['created'];

        newActivity['plans'] = {};
        newActivity['plans'][planId] = "1";

        var entry = {};
        entry[created] = newActivity;

        //
        // For simultaneous, multi-location updates
        // See: https://www.firebase.com/blog/2015-09-24-atomic-writes-and-more.html
        //
        var userUpdate = {};
        userUpdate["activities/" + created] = newActivity;
        userUpdate["plans/" + planId]       = this.plan;

        return new Promise(function(resolve, reject) {
            // _this.userServ.updateUserData(entry, 'activities').then(function() {
            _this.userServ.updateUserData(userUpdate).then(function() {
                _this.saveMsg.flashMsg();
                _this.trackActivity(created, newActivity);
                _this.activities.sort(_this.sortActivities.bind(_this));
                resolve();
            });
        });

    }

    delActivity(activity) {
        var _this      = this;
        var planId     = this.plan['created'];
        var activityId = activity['created'];

        console.log("Deleting activity", activity, planId);

        return new Promise(function(resolve, reject) {
            _this.userServ.delUserActivityFromPlan(activity, planId).then(function(err) {
                if (err) {
                    console.error("Failed attempting to delete activity from plan with error: " + err, activity, planId);
                } else {
                    for (var i = 0; i < _this.activities.length; i++) {
                        if (activityId == _this.activities[i]['created']) {
                            _this.activities.splice(i, 1);   // remove this entry
                            break;
                        }
                    }

                    if (!_this.activities.length) {
                        // No more activities in plan, so reset/update to most recent plan
                        _this.getCurrentPlan();
                    }

                    console.log("Succesfully deleted activity from plan", activity, planId);
                }

                resolve();
            });
        });
    }

}
