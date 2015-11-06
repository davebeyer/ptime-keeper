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
    //       dependency injection!

    constructor(@Inject(FirebaseService) fBase : FirebaseService) {
        console.log("users.ts: UserService constructor")

        var _this  = this;

        this.fBase = fBase;

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

    updateUserData(authData) {
        var provider;

        if (authData) {
            provider = authData.provider;
        } else {
            provider = null;
        }

        switch(provider) {
        case 'google':
            this.isLoggedIn      = true;
            this.firstName       = authData.google.cachedUserProfile.given_name;
            this.lastName        = authData.google.cachedUserProfile.family_name;
            this.profileImageURL = authData.google.profileImageURL;
            this.fullName        = authData.google.cachedUserProfile.name;
            this.userId          = null; // TBD
            break;
        default:
            this.isLoggedIn      = false;

            this.firstName       = null; 
            this.lastName        = null; 
            this.profileImageURL = null;
            this.fullName        = null;
	    this.userId          = null;
            break;
        }
    }
}
