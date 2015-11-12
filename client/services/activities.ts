/// <reference path="../../typings/tsd.d.ts" />

// @Inject needed for Services to support dependency injection
import {Inject} from 'angular2/core';

import {FirebaseService} from './firebase';
import {UserService}     from './user';

export class ActivitiesService {
    fBase    : FirebaseService;
    userServ : UserService;

    constructor(@Inject(FirebaseService) fBase    : FirebaseService,
		@Inject(UserService)     userServ : UserService) {
        console.log("activities.ts: in ActivitiesService constructor")

	this.userServ = userServ;
	this.fBase    = fBase;
    }

    onInit() {
    }
}
