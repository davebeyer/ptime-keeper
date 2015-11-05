/// <reference path="../../typings/tsd.d.ts" />

import {Component, View, EventEmitter} from 'angular2/angular2';

export class UserService {
    user  : any;
    fbRef : Firebase;  // ToDo: use dependency injector to get Database service

    constructor() {
        console.log("users.ts: in UserService constructor")

        // Only initialize locally instatiated data here 
        // (angular2-dependent data has not yet been fully initialized)

        this.fbRef = null;
        this.user  = {};

        // Initialize
        this.updateUserData(null);

        console.log("users.ts: finished UserService constructor")
    }

    setDB(fbRef) {
        var _this  = this;
        this.fbRef = fbRef;

        // Register the authentication callback
        this.fbRef.onAuth(function(authData) {
            _this.updateUserData(authData);
        });
    }

    login(provider) {
        var _this = this;

        if (provider === 'facebook') {
            alert("Sorry, Facebook signin not yet supported");
            return;
        }

        this.fbRef.authWithOAuthPopup(provider, function(error, authData) {
            if (error) {
                if (error.code === "TRANSPORT_UNAVAILABLE") {
                    // Could be due to not allowing pop-ups in this env
                    _this.fbRef.authWithOAuthRedirect("google", function(error) {
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
        this.fbRef.unauth();
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

	    this.user.fullName        = this.user.firstName + ' ' + this.user.lastName;
            break;
        default:
            this.user.isLoggedIn      = false;
            this.user.firstName       = null; 
            this.user.lastName        = null; 
            this.user.profileImageURL = null;
	    this.user.fullName        = null;
            break;
        }
    }
}
