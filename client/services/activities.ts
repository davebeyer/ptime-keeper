/// <reference path="../../typings/tsd.d.ts" />

// @Inject needed for Services to support dependency injection
import {Inject} from 'angular2/core';

import {FirebaseService}   from './firebase';
import {UserService}       from './user';
import {SaveMsg}           from '../components/savemsg';

var moment = require('moment');

declare var jQuery:any;

export class ActivitiesService {
    NullCategory     = {name : '', color : 'transparent'};
    categoryColors   = ['Black', 'Blue', 'Brown', 'Cyan', 'Gold', 'Grey', 'Green', 'Lime', 'Maroon', 'Orange', 'Pink', 'Purple', 'Red', 'Yellow'];

    fBase            : FirebaseService;
    userServ         : UserService;
    saveMsg          : SaveMsg;

    categories       : Array<any>;
    categoryDict     : any;

    plan             : any;
    planDate         : string;
    planTime         : string;

    _notifyInit      : any;

    activities       : Array<any>;
    workActivity     : any;  // current work activity

    constructor(@Inject(FirebaseService) fBase    : FirebaseService,
                @Inject(UserService)     userServ : UserService,
                @Inject(SaveMsg)         saveMsg  : SaveMsg) {
        var _this = this;
        console.log("activities.ts: in ActivitiesService constructor")

        this.userServ   = userServ;
        this.fBase      = fBase;

        this.saveMsg    = saveMsg;

	this.resetPlan();

        this.categories       = [];
        this.categoryDict     = {};

        this._notifyInit      = null;

        // Register with the authentication callback
        this.userServ.loginNotify(function() {
            _this.getCategories().then(function() {
                return _this.getCurrentPlan();
            }).then(function() {
                if (_this._notifyInit) {
                    _this._notifyInit();
                }
            });
        });

	this.clearWorkActivity();
    }

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
	if (!activity || (this.workActivity['created'] == activity['created'])) {
	    this.workActivity = null;
	}
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

    workColor() {
	if (!this.workActivity) { 
	    return 'black';
	}

	return this.categoryColor(this.workActivity.category);
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
        this.activities = [];
    }

    startNewPlan() {
	this.resetPlan();
    }

    initPlan(plan, planId) {
        var _this = this;

        this.plan            = plan
        this.plan['created'] = planId     // convenience

        var parseableDT  = planId.replace('_', '.');
        var momDT        = moment(parseableDT);

        this.planDate    = momDT.format("ddd, DMMMYY");
        this.planTime    = momDT.format("h:mma");

        // Update plan-title tooltip(s) (after DOM refreshed)
        setTimeout(function() {
            var title = _this.planDate + " Plan created at " + _this.planTime;
            var $title = jQuery(".plan-title");
            if ($title.attr('data-original-title') === undefined) {
                $title.tooltip({placement: 'top'});
            } else {
                $title.attr('data-original-title', title).tooltip('fixTitle');
            }
        }, 10);
    }

    getCurrentPlan() {
        var _this = this;

        return new Promise(function(resolve, reject) {
            _this.userServ.getUserData('plans', {limitToLast : true}).then(function(value) {
                if (!value) {
                    _this.plan        = null;
                    _this.activities  = [];
                    resolve(_this.plan);
                } else {
                    var planId = Object.keys(value)[0];  // should only be one key

                    _this.initPlan(value[planId], planId);

                    // NOTE: Alternatively could iterate to get activities listed in 
                    //       plan.activities.

                    _this.userServ.getUserActivitiesForPlan(planId).then(function(value) {
                        if (value) {
                            _this.activities = [];

                            var activity;
                            var ids = Object.keys(value);

                            for (var i=0; i < ids.length; i++) {
                                _this.trackActivity(value[ids[i]]);
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

    trackActivity(info) {
        this.activities.push(info);        
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

        var created = this.fBase.dateToKey(new Date());

        var newActivity = {
            category       : values.categoryId,
            created        : created,
            description    : values.description,
            estimated_poms : values.pomodoros
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
                _this.trackActivity(newActivity);
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
