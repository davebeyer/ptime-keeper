/// <reference path="../../typings/angular2/angular2.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/firebase/firebase.d.ts" />

import {Component, View, EventEmitter} from 'angular2/angular2';

export var User = {};

@Component({
    selector: 'user-block',
    events:   ['initevent']     // NOTE that event names must be all lower case
})

@View({
    template: `
      <div class="container">
        <div class="signin-form">
          <div [hidden]="user.isLoggedIn">
            <h3 class="form-signin-heading">Please sign in using:</h3>
            <button class="btn btn-lg btn-primary btn-block" (click)="login('google')">  Google  </button>
            <button class="btn btn-lg btn-primary btn-block" (click)="login('facebook')">Facebook</button>
          </div>

          <div [hidden]="!user.isLoggedIn">
            Hello {{user.firstName}} <img src="{{user.profileImageURL}}"/> 
            <a class="btn" (click)="logout()">
              Sign out
            </a>
          </div>
        </div>
      </div>
      `
})

export class UserBlock {
    user : any;
    
    //
    // Currently a 3-step initialization to hook-up child to parent components
    //
    //   constructor() - [name fixed by JS/Typescript] local (non-angular2-dependent) data only 
    //
    //   onInit()      - [name fixed by angular2] angular2 lifecycle init-done event callback 
    //                   Generate a initevent [DB convention name] to alert parent of new child component.
    //                   (Parent component will then typically have a register<ChildComponentType>() event handler)
    //
    //   registerParent() - [DB convention name] called by parent component
    //
    // TODO: Easier method to get pointers to parent & children components 
    //       (and/or their needed data)
    //
    //

    parent        : any;  
    fbRef         : Firebase;      // ToDo: use dependency injector to get Database service
    initevent     : EventEmitter;

    constructor() {
        console.log("main.ts: in UserBlock constructor")

        // Only initialize locally instatiated data here 
        // (angular2-dependent data has not yet been fully initialized)

        this.initevent = new EventEmitter();

        this.parent    = null;  // will be set by the parent
        this.fbRef     = null;

        this.user      = User;

        // Initialize
        this.updateUserData(null);

        console.log("main.ts: finished UserBlock constructor")
    }

    onInit() {
        // onInit() is a angular2 lifecycle method called 
        // automatically after angular2 has completed initialization

        console.log("onInit: for Users Component", this);
        this.initevent.next(this); // send initevent to parent component
    }

    registerParent(parent, fbRef) {
	var self = this;

	this.fbRef  = fbRef;
	this.parent = parent;

        // Register the authentication callback
        this.fbRef.onAuth(function(authData) {
            self.updateUserData(authData);
        });
    }

    login(provider) {
	var self = this;

        if (provider === 'facebook') {
            alert("Sorry, Facebook signin not yet supported");
            return;
        }

        this.fbRef.authWithOAuthPopup(provider, function(error, authData) {
            if (error) {
                if (error.code === "TRANSPORT_UNAVAILABLE") {
                    // Could be due to not allowing pop-ups in this env
                    self.fbRef.authWithOAuthRedirect("google", function(error) {
                        if (error) {
                            console.log("Login Failed!", error);
                        } 
                    });
                } else {
                    console.log("Login Failed!", error);
                }
            } else if (authData) {
                self.updateUserData(authData); // accelerate the process a little
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
            break;
        default:
            this.user.isLoggedIn      = false;
            this.user.firstName       = null; 
            this.user.lastName        = null; 
            this.user.profileImageURL = null;
            break;
        }
    }
}
