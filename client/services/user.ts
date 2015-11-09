/// <reference path="../../typings/tsd.d.ts" />

// @Inject needed for Services to support dependency injection
import {Inject} from 'angular2/core';

import {FirebaseService} from './firebase';

export class UserService {
    fBase : FirebaseService;
    
    // User Data
    isLoggedIn : boolean;
    userId     : number;

    firstName  : string;
    lastName   : string;
    fullName   : string;
    profileImageURL : string;

    // NOTE: Since this class doesn't have any annotations 
    //       (and thus no angular2 metadata attached by default), we need
    //       to use @Inject here to force metadata to be added, to support
    //       dependency injection.

    constructor(@Inject(FirebaseService) fBase : FirebaseService) {
        console.log("users.ts: UserService constructor")

        var _this  = this;

        this.fBase = fBase;

        // Initialize
        this.resetUserData();

        // Register the authentication callback
        this.fBase.fbRef.onAuth(function(authData) {
            _this.updateUserIdData(authData);
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
                _this.updateUserIdData(authData); // accelerate the process a little
                console.log("Authenticated successfully with payload:", authData);
            } else {
                console.log("Login apparently failed, but without error info");
            }
        });
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

    updateUserIdData(authData) {
        if (authData == null) {
            this.resetUserData();
            return;
        }
        
        var _this = this;

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
            return;
        }

        //
        // Look up user info, then set all user data at once 
        // (so UI is updated all at once)
        //

        this.fBase.getUser(provider, providerUserId).then(function(userInfo) {
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
                break;
            default:
            console.error("UserService:updateUserIdData - Unsupported provider", provider);
            return;
            }

        });
    }

    updateUserData(data : any, path? : string) {
        var _this = this;

        return new Promise(function(resolve, reject) {
            var userId = _this.userId;
            if (!userId) {
                reject("No signed in user, so unable to update user data!");
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

    getUserActivitiesForPlan(planId) {
        var _this = this;
        var fbRef = this.fBase.fbRef;

        return new Promise(function(resolve, reject) {
            var userId = _this.userId;
            if (!userId) {
                reject("No signed in user, so unable to get user activities!");
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
