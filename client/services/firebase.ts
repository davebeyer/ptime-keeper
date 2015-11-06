/// <reference path="../../typings/tsd.d.ts" />

// @Inject needed for Services to support dependency injection
import {Inject} from 'angular2/core';

var Firebase = require('firebase/lib/firebase-web.js');

var DfltLongBreak_mins  = 15;
var DfltShortBreak_mins = 5;
var DfltWork_mins       = 25;

var DBSetup = {
    defaults : {
        longBreak_mins   : DfltLongBreak_mins,
        shortBreak_mins  : DfltShortBreak_mins,
        work_mins        : DfltWork_mins
    },

    authProviders : {
        facebook : {
            dummyFBUserId : {
                userId : 'dummyLocalUserId'
                // Possible other info 
            }
        },
        google   : {
            dummyGoogUserId : {
                userId : 'dummyLocalUserId',
                // Possible other info 
            }
        },
    },

    userIdentities : {
        userIdCount : 0,

        dummyLocalUserId : {
            authProviders : {
                google   : 'dummyGoogUserId',
                facebook : 'dummyFBUserId'
            }

            // Possible other info (but probably best not to 
            // copy info from authProviders, store that under 
            // appropriate authProvider entry
        }
    },

    userData : {
        dummyLocalUserId : {
            created_dt : "2015-11-01"
        }
    }
};


export class FirebaseService {
    fbRef : Firebase;

    constructor() {
        console.log("firebase.ts: in FirebaseService constructor")
        this.fbRef  = new Firebase('https://ptime-keeper.firebaseio.com');
    }

    initDB() {
        var _this = this;

        return new Promise(function(resolve, reject) {

            _this.fbRef.once('value', function(data) {
                if (data.child('defaults').exists()) {
                    resolve("DB already exists.");
                } else {
                    _this.fbRef.update(DBSetup, function() {
                        resolve("DB initialized");
                    }); 
                }
            });
        });
    }

}
