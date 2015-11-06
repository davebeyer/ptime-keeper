/// <reference path="../../typings/tsd.d.ts" />

// @Inject needed for Services to support dependency injection
import {Inject} from 'angular2/core';

var Firebase = require('firebase/lib/firebase-web.js');

export class FirebaseService {
    fbRef : Firebase;

    constructor() {
	console.log("firebase.ts: in FirebaseService constructor")
        this.fbRef  = new Firebase('https://ptime-keeper.firebaseio.com');
    }

    prepareDB(userEmail, doneCB) {
        var _this = this;
        
        _this.fbRef.once('value', function(data) {

            if (data.child('vocabs').exists()) {
                _this.prepareDBForUser(doneCB);
            } else {
                var dbSetup = {
                    vocabs : {
                        accounts   : {
                            Schwab : 'Schwab',
                            TD     : 'TD Ameritrade'
                        },
                        strategies : {
                            MM     : 'what MM stands for',
                            CC     : 'what CC stands for',
                            'CC-a' : 'what CC-a stands for'
                        }
                    }
                };

                _this.fbRef.update( dbSetup, function() {
                    _this.prepareDBForUser(doneCB);
                }); 
            }
        });       
    }
}