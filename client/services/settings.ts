/// <reference path="../../typings/tsd.d.ts" />

// @Inject needed for Services to support dependency injection
import {Inject} from 'angular2/core';

import {FirebaseService} from './firebase';
import {UserService}     from './user';

export class SettingsService {
    fBase    : FirebaseService;
    userServ : UserService;

    // NOTE: Since this class doesn't have any annotations 
    //       (and thus no angular2 metadata attached by default), we need
    //       to use @Inject here to force metadata to be added, to support
    //       dependency injection.

    constructor(@Inject(FirebaseService) fBase    : FirebaseService,
                @Inject(UserService)     userServ : UserService) {
        console.log("settings.ts: in FirebaseService constructor");
        this.fBase    = fBase;
        this.userServ = userServ;
    }

    getSetting(name) {
        var _this = this;

        return new Promise(function(resolve, reject) {
            _this.getUserSetting(name).then(function(val) {
                if (val != null) {
                    resolve(val);
                    return;
                }

                var dfltsRef = _this.fBase.fbRef.child('defaults');

                dfltsRef.child(name).once('value', function(data){
                    if (data.val() == null) {
                        reject("Invalid/unknkown setting: " + name);
                        return;
                    } else {
                        resolve(data.val());
                        return;
                    }
                });
            });
        });
    }

    getAllSettings() {
        var _this = this;

        return new Promise(function(resolve, reject) {
            var dfltsRef = _this.fBase.fbRef.child('defaults');
            var results  = {};

            dfltsRef.once('value', function(data){
                // start with defaults
                if (data.val() != null) {
                    results = data.val();
                }
                _this.getAllUserSettings().then(function(value) {
                    // then overwrite user settings
                    if (value != null) {
                        var keys = Object.keys(value);
                        var key;
                        for (var i = 0; i < keys.length; i++) {
                            key = keys[i];
                            results[key] = value[key];
                        }
                    }
                    resolve(results);
		});
            });
	});
    }
    
    getUserSetting(name) {
        var _this = this;

        return new Promise(function(resolve, reject) {
            if (!_this.userServ.userId) {
                resolve(null);
                return;
            }

            var userDataRef = _this.fBase.fbRef.child('userData').child(_this.userServ.userId.toString());

            userDataRef.child('preferences').child(name).once('value', function(data){
                resolve(data.val()); // might be null if not present
            });
        });
    }

    getAllUserSettings() {
        var _this = this;

        return new Promise(function(resolve, reject) {
            if (!_this.userServ.userId) {
                resolve(null);
                return;
            }

            var userDataRef = _this.fBase.fbRef.child('userData').child(_this.userServ.userId.toString());

            userDataRef.child('preferences').once('value', function(data){
                resolve(data.val()); // might be null if not present
            });
        });
    }

    //
    // Settings object should be something like:
    //    {work_mins : 25, shortBreak_mins : 7}  
    // with one or more variables
    //

    setUserSettings(settingsObj) {
        var _this = this;

        return new Promise(function(resolve, reject) {
            if (!_this.userServ.userId) {
                reject("UserService:setUserSetting - No user currently signed in!");
                return;
            }

            var userDataRef = _this.fBase.fbRef.child('userData').child(_this.userServ.userId.toString());

            var dbEntry = {preferences : settingsObj};

            userDataRef.update(dbEntry, function() {
                resolve();
            });
        });
    }
}
