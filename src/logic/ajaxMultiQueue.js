/*
* AJAXMultiQueue - A queue for multiple concurrent ajax requests
* Dual licensed under the MIT and GPL licenses.
*
* (c) 2018 Alexis Rico
* (c) 2013 Amir Grozki
* (c) 2011 Corey Frang
*/

import $ from 'jquery';

export function createAjaxQueue(n) {
    return new MultiQueue(~~n);
}

function MultiQueue(number) {
    let queues, i, current = 0;
    let petitions = new Set();

    if (!queues) {
        queues = new Array(number);

        for(i = 0; i < number; i++) {
            // jQuery on an empty object, we are going to use this as our Queue
            queues[i] = $({});
        }
    }

    function queue(ajaxOpts) {
        if (petitions.has(ajaxOpts.url)) return;
        petitions.add(ajaxOpts.url);

        let jqXHR,
            dfd = $.Deferred(),
            promise = dfd.promise();

        // queue our ajax request
        queues[current].queue(doRequest);

        current = (current + 1) % number;

        // add the abort method
        promise.abort = function(statusText) {
            // proxy abort to the jqXHR if it is active
            if (jqXHR) return jqXHR.abort(statusText);

            let i, queue, index;

            // if there wasn't already a jqXHR we need to remove from queue
            for (i = 0; i < number || index < 0; i++) {
                queue = queues[current].queue();
                index = $.inArray(doRequest, queue);
            }

            if (index > -1) {
                queue.splice(index, 1);
            }

            // and then reject the deferred
            dfd.rejectWith(ajaxOpts.context || ajaxOpts, [promise, statusText, ""]);
            return promise;
        };

        // run the actual query
        function doRequest(next) {
            jqXHR = $.ajax(ajaxOpts)
                .done(dfd.resolve)
                .fail(dfd.reject)
                .then(next, next);
        }

        return promise;
    }

    return {
        queue: queue
    };
}