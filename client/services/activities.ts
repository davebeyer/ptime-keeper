/// <reference path="../../typings/tsd.d.ts" />

// @Inject needed for Services to support dependency injection
import {Inject} from 'angular2/core';

import {FirebaseService}   from './firebase';
import {UserService}       from './user';
import {SaveMsg}           from '../components/savemsg';

var moment = require('moment');

declare var jQuery:any;

export class ActivitiesService {
    fBase            : FirebaseService;
    userServ         : UserService;
    saveMsg          : SaveMsg;

    categoryColors = ['Black', 'Blue', 'Brown', 'Cyan', 'Gold', 'Grey', 'Green', 'Lime', 'Maroon', 'Orange', 'Pink', 'Purple', 'Red', 'Yellow'];

    categories       : Array<any>;
    categoryDict     : any;

    plan             : any;
    planDate         : string;
    planTime         : string;

    activities       : Array<any>

    constructor(@Inject(FirebaseService) fBase    : FirebaseService,
                @Inject(UserService)     userServ : UserService,
                @Inject(SaveMsg)         saveMsg  : SaveMsg) {
        var _this = this;
        console.log("activities.ts: in ActivitiesService constructor")

        this.userServ   = userServ;
        this.fBase      = fBase;

        this.saveMsg    = saveMsg;

        this.plan       = null;
        this.planDate   = '';
        this.planTime   = '';

        this.activities = [];

        this.categories       = [];
        this.categoryDict     = {};

        // Register with the authentication callback
        this.userServ.loginNotify(function() {
            _this.getCategories().then(function() {
                _this.getCurrentPlan();
            });
        });

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

    //
    // Plan handling
    //

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
}
