/// <reference path="../../typings/tsd.d.ts" />

import {Router}                   from 'angular2/router';

// @Inject needed for Services to support dependency injection
import {Inject} from 'angular2/core';

/**
 * RouterService allows us to create a list of subscribers that can persist
 */
export class RouterService {
    router      : Router;
    currentURL  : string;

    subscribers : any;

    // NOTE: Since this class doesn't have any annotations 
    //       (and thus no angular2 metadata attached by default), we need
    //       to use @Inject here to force metadata to be added, to support
    //       dependency injection.

    constructor(@Inject(Router) router : Router) {
        var _this = this;
        console.log("router.ts: in RouterService constructor");

        this.router     = router;

        this.currentURL  = null;
        this.subscribers = {};

        this.router.subscribe(function(url) {
            // strange(?) that router emits an url and not 
            // a more parseable instruction
            _this.currentURL = url;
            console.log("router navigated to", url);

            var subIds = Object.keys(_this.subscribers);

            for (var i = 0; i < subIds.length; i++) {
                try {
                    _this.subscribers[subIds[i]](url);
                } catch (err) {
                    console.error("RouterService: Error reaching subscriber ", 
                                  subIds[i], err);
                }
            }
        });
    }

    subscribe(subId: string, cb : any) {
        // Use a dictionary to overwrite possible duplicate subscriptions
        this.subscribers[subId] = cb;
    }
}
