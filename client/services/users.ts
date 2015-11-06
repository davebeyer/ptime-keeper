/// <reference path="../../typings/tsd.d.ts" />

// @Inject needed for Services to support dependency injection
import {Inject} from 'angular2/core';

import {FirebaseService} from './firebase';

export class UserService {
    user  : any;
    fBase : FirebaseService;

    // NOTE: Since this class doesn't have any annotations 
    //       (and thus no angular2 metadata attached by default), we need
    //       to use @Inject here to force metadata to be added, to support
    //       dependency injection!

    constructor(@Inject(FirebaseService) fBase : FirebaseService) {
        console.log("users.ts: UserService constructor")

        var _this  = this;

        this.fBase = fBase;
        this.user  = {};

        // Initialize
        this.updateUserData(null);

        // Register the authentication callback
        this.fBase.fbRef.onAuth(function(authData) {
            _this.updateUserData(authData);
        });
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
                _this.updateUserData(authData); // accelerate the process a little
                console.log("Authenticated successfully with payload:", authData);
            } else {
                console.log("Login apparently failed, but without error info");
            }
        });
    }

    logout() {
        this.fBase.fbRef.unauth();
        this.updateUserData(null);
    }

    isLoggedIn() {
        return this.user.isLoggedIn;
    }

    firstName() {
        return this.user.firstName;
    }

    profileImageURL() {
        return this.user.profileImageURL;
    }

    updateUserData(authData) {
        this.user._authData   = authData;

        var provider;

        if (authData) {
            provider = authData.provider;
        } else {
            provider = null;
        }

        switch(provider) {
        case 'google':
            this.user.isLoggedIn      = true;
            this.user.firstName       = this.user._authData.google.cachedUserProfile.given_name;
            this.user.lastName        = this.user._authData.google.cachedUserProfile.family_name;
            this.user.profileImageURL = this.user._authData.google.profileImageURL;
            this.user.fullName        = this.user._authData.google.cachedUserProfile.name;
            this.user.id              = 'google:' + this.user._authData.google.id;
            break;
        default:
            this.user.isLoggedIn      = false;
            this.user.firstName       = null; 
            this.user.lastName        = null; 
            this.user.profileImageURL = null;
            this.user.fullName        = null;
            this.user.emailAdr        = null;
            break;
        }
    }
}
