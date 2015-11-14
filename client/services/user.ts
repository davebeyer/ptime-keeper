/// <reference path="../../typings/tsd.d.ts" />

// @Inject needed for Services to support dependency injection
import {Inject} from 'angular2/core';

import {FirebaseService} from './firebase';

export class UserService {
    fBase      : FirebaseService;
    
    // User Data
    isLoggedIn : boolean;
    userId     : number;

    firstName  : string;
    lastName   : string;
    fullName   : string;
    profileImageURL : string;

    _notifyLoginCB : any;

    // NOTE: Since this class doesn't have any annotations 
    //       (and thus no angular2 metadata attached by default), we need
    //       to use @Inject here to force metadata to be added, to support
    //       dependency injection.

    constructor(@Inject(FirebaseService) fBase    : FirebaseService) {
        var _this = this;
        console.log("users.ts: UserService constructor")

        this.fBase          = fBase;

        this._notifyLoginCB = null;

        // Initialize
        this.resetUserData();

        // Register the authentication callback
        this.fBase.fbRef.onAuth(function(authData) {
            _this.updateUserIdentityData(authData).then(function() {
                if (_this._notifyLoginCB) {
                    _this._notifyLoginCB();
                }
            });
        });

        // ///////////////////////
        // Fake data for testing
        // this.setupDummyUser();
        // ///////////////////////
    }

    login(provider) {
        var _this = this;

        if (provider === 'facebook') {
            alert("Sorry, Facebook signin not yet supported");
            return;
        }

        this.fBase.fbRef.authWithOAuthPopup(provider, function(error, authData) {
            if (error) {
                if (error.code === "TRANSPORT_UNAVAILABLE") {
                    // Could be due to not allowing pop-ups in this env
                    _this.fBase.fbRef.authWithOAuthRedirect("google", function(error) {
                        if (error) {
                            console.log("Login Failed!", error);
                        } 
                    });
                } else {
                    console.log("Login Failed!", error);
                }
            } else if (authData) {
                // accelerate the process a little
                _this.updateUserIdentityData(authData).then(function() {
                    console.log("Authenticated successfully with payload:", authData);
                });
            } else {
                console.log("Login apparently failed, but without error info");
            }
        });
    }

    loginNotify(cb : any) {
        // TODO: create a list if needed later
        this._notifyLoginCB = cb;
        
        if (this.userId) {
            // Already signed in, so callback immediately
            this._notifyLoginCB();
        }
    }

    logout() {
        this.fBase.fbRef.unauth();
        this.resetUserData();
    }

    resetUserData() {
        this.isLoggedIn      = false;
        this.firstName       = null; 
        this.lastName        = null; 
        this.profileImageURL = null;
        this.fullName        = null;
        this.userId          = null;
    }

    setupDummyUser() {
        this.isLoggedIn      = true;
        this.firstName       = "Dummy"; 
        this.lastName        = "User"; 
        this.profileImageURL = "";
        this.fullName        = "Dummy User";
        this.userId          = 10;
    }

    updateUserIdentityData(authData) {
        var _this = this;

        return new Promise(function(resolve, reject) {
            if (authData == null) {
                _this.resetUserData();
                resolve();
                return;
            }
            
            var provider;
            var providerUserId;

            //
            // First determine provider & provider's user ID in order to 
            // lookup (or create) user info record
            //

            provider = authData.provider;

            switch(provider) {
            case 'google':
                providerUserId = authData.google.id;
                break;
            default:
                console.error("UserService:updateIdUserData - Unsupported provider", provider);
                reject("updateUserIdentityData() failed");
                return;
            }

            //
            // Look up user info, then set all user data at once 
            // (so UI is updated all at once)
            //

            _this.fBase.getUser(provider, providerUserId).then(function(userInfo) {
                console.log("UserId is ", userInfo['userId']);

                _this.userId = userInfo['userId'];

                // TODO: This stuff may later be in returned userInfo record, or 
                //       from other associated provider records
                switch(provider) {
                case 'google':
                    _this.isLoggedIn      = true;
                    _this.firstName       = authData.google.cachedUserProfile.given_name;
                    _this.lastName        = authData.google.cachedUserProfile.family_name;
                    _this.profileImageURL = authData.google.profileImageURL;
                    _this.fullName        = authData.google.cachedUserProfile.name;

		    resolve();
                    return;
                default:
                    console.error("UserService:updateUserIdentityData - Unsupported provider", provider);
                    reject("updateUserIdentityData() failed");
                    return;
                }

            });
        });
    }

    updateUserData(data : any, path? : string) {
        var _this = this;

        return new Promise(function(resolve, reject) {
            var userId = _this.userId;
            if (!userId) {
                reject("No signed in user, so unable to update user data!");
                return;
            }

            var dataRef;
            if (path) {
                dataRef = _this.fBase.fbRef.child('userData').child(userId.toString()).child(path);
            } else {
                dataRef = _this.fBase.fbRef.child('userData').child(userId.toString());
            }

            dataRef.update(data, function() {
                resolve();
            });
        });
    }

    /**
     * This  removes this activity from this plan, unless 
     * the activity is attached to no other plans, and has no events, 
     * in which case the activity is deleted entirely.
     */
    delUserActivityFromPlan(activity, planId) {
        var _this      = this;
        var userRef    = this.fBase.fbRef;
        var activityId = activity['created'];

        var actPath    = 'activities/' + activityId;
        var planPath   = 'plans/'      + planId + '/activities/' + activityId;

        return new Promise(function(resolve, reject) {
            var userId = _this.userId;
            if (!userId) {
                reject("No signed in user, so unable to delete activity data!");
                return;
            }

            var userRef = _this.fBase.fbRef.child('userData').child(userId.toString());

            _this._unlinkActivityFromPlan(activityId, planId).then(function() {
                var dataRef = userRef.child(actPath);

                if (_this.canDelActivity(activity, planId)) {
                    dataRef.remove(function(err) {
                        if (err) {
                            console.error("Error, unable to delete activity", activity, planId);
                            reject("Attempt to delete activity failed with error: " + err);
                            return;
                        }
                        resolve();
                    });
                } else {
                    dataRef = dataRef.child("plans/" + planId);
                    dataRef.remove(function(err) {
                        if (err) {
                            console.error("Error, unable to delete activity's reference to plans", activity, planId);
                            reject("Attempt to delete activity failed with error: " + err);
                            return;
                        }
                        resolve();
                    });
                }
            });
        });
    }

    /**
     * Only unlinks the activity from a given plan 
     * (does NOT also handle unlinking the plan from the activity)
     */
    _unlinkActivityFromPlan(activityId, planId) {
        var _this   = this;
        var userRef = this.fBase.fbRef;
        var path    = 'plans/' + planId;

        return new Promise(function(resolve, reject) {
            var userId = _this.userId;
            if (!userId) {
                reject("No signed in user, so unable to unlink activity from plan!");
                return;
            }

            var userRef = _this.fBase.fbRef.child('userData').child(userId.toString());
            var dataRef = userRef.child(path);

            _this.canDelPlan(planId, activityId).then(function(canDel) {
                if (!canDel) {
                    // Just remove link
                    dataRef = dataRef.child('activities/' + activityId);
                    dataRef.remove(function(err) {
                        if (err) {
                            console.error("Error, unable to unlink plan's reference to activity", activityId, planId);
                            reject("Attempt to unlink activity from plan failed with error: " + err);
                            return;
                        } 
                        resolve();
                    });
                } else {
                    // Remove entire plan
                    dataRef.remove(function(err) {
                        if (err) {
                            console.error("Error, unable to delete plan (when unlinking activity)", activityId, planId);
                            reject("Attempt to unlink activity from plan failed with error: " + err);
                            return;
                        } 
                        resolve();
                    });
                }
            });
        });
    }

    canDelPlan(planId, ignoreActivityId) {
        var _this   = this;
        var userRef = this.fBase.fbRef;
        var path    = 'plans/' + planId;

        return new Promise(function(resolve, reject) {
            _this.getUserData(path).then(function(data) {
                if (!data || !data['activities']) {
                    resolve(true);
                    return;
                }

                var activityIds = Object.keys(data['activities']);
                for (var i = 0; i < activityIds.length; i++) {
                    if (activityIds[i] == ignoreActivityId) {
                        continue;
                    }
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }

    canDelActivity(activity, ignorePlanId?) {
        if (activity.events && Object.keys(activity.events).length) {
            // Activity has events, so not ok to delete
            return false; 
        }

        // No events, so a candidate to delete
        
        if (!activity.plans) {
            return true;  // No plans, so ok to delete
        }

        var planIds = Object.keys(activity.plans);
        for (var i = 0; i < planIds.length; i++) {
            if (planIds[i] == ignorePlanId) {
                continue; // ignore this one
            } 

            // On a plan other than the ignored plan, so not ok to delete
            return false;  
        }

        // ok to delete
        return true;
    }

    getUserActivitiesForPlan(planId) {
        var _this = this;
        var fbRef = this.fBase.fbRef;

        return new Promise(function(resolve, reject) {
            var userId = _this.userId;
            if (!userId) {
                reject("No signed in user, so unable to get user activities!");
                return;
            }

            var actPath  = 'userData/' + userId + '/activities';
            var planPath = 'plans/' + planId;

            // Notice that this skips over activity id keys, and be sure to include equalTo()
            fbRef.child(actPath).orderByChild(planPath).equalTo('1').once('value', function(data) {
                resolve(data.val());  // may be null;
            });
        });
    }

    getUserData(path : string, options? : any) {
        if (!options) { options = {}; }

        var _this = this;

        return new Promise(function(resolve, reject) {
            var userId = _this.userId;
            var fbRef  = _this.fBase.fbRef;
            var dataRef;

            if (!userId) {
                resolve(null);
            }

            if (options.limitToLast) {
                dataRef = fbRef.child('userData').child(userId.toString()).child(path).limitToLast(1);
            } else {
                dataRef = fbRef.child('userData').child(userId.toString()).child(path);
            }

            dataRef.once('value', function(data) {
                resolve(data.val());
            });
        });
    }
}
