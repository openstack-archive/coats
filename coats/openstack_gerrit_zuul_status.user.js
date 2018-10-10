// Copyright 2018 Michel Peterson
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ==UserScript==
// @name     Gerrit Zuul Status
// @author   Michel Peterson
// @version  6
// @grant    none
// @include  /^https?://review\.openstack\.org/(#/c/)?\d*?/?(\d*)?/?$/
// @require  https://code.jquery.com/jquery-3.3.1.min.js
// @require  https://review.openstack.org/static/hideci.js
// ==/UserScript==

// Config

// loads jQuery with a callback when jQuery has loaded
function addJQuery(callback) {
    var script = document.createElement("script");
    script.setAttribute("src", "https://code.jquery.com/jquery-3.3.1.min.js");
    script.addEventListener("load", function() {
        var script = document.createElement("script");
        script.textContent = "$=jQuery.noConflict(true);(" + callback.toString() + ")();";
        document.body.appendChild(script);
    }, false);
    // document.body.appendChild(script);
}
// /Config

// Script start

/* defined by hideci.js */
/* global ci_latest_patchset, ci_parse_comments */
function main() {
    const zuul_servers = {
        "openstack": {
            "zuul_status_base": "https://zuul.openstack.org/",
            "zuul_api": "api/status/change/" },
        "rdo": {
            "zuul_status_base": "https://softwarefactory-project.io/zuul/api/tenant/rdoproject.org/",
            "zuul_api": "status/change/" }
    };
    // eslint-disable-next-line no-undef
    $("style#gerrit_sitecss").append(".result_RUNNING { color: #1e9ced; }");

    var render = function(jobs) {
        // eslint-disable-next-line no-undef
        var location = $("table.test_result_table");

        var table = "<tbody>";

        for(var server in jobs) {
            table += "<tr>" +
                "<td class=\"header\">Zuul check on " + server + "</td>" +
                "<td class=\"header ci_date result_WARNING\">Still running</td>" +
                "</tr>";

            for (var i in jobs[server]) {
                if (jobs[server].hasOwnProperty(i)) {
                    var job = jobs[server][i];

                    var status_with_completeness = ((job.status === "running" && typeof job.completeness !== "undefined") ? "RUNNING (" + job.completeness + ")" : job.status.toUpperCase());
                    var voting = job.voting === true ? "" : "<small> (non-voting)</small>";

                    table += "<tr>" +
                        "<td><a href=\"" + job.url + "\" rel=\"nofollow\">" + job.name + "</a>" + voting + "</td>" +
                        "<td><span class=\"comment_test_result\"><span class=\"result_" + job.status.toUpperCase() + "\">" + status_with_completeness + "</span></td>" +
                        "</tr>";
                }
            }

        }

        table += "</tbody>";

        location.html(table);
    };

    var main_loop = function(jobs_dict = {}) {
        // eslint-disable-next-line no-undef
        const url = $(location).attr("href");
        const matches_url = /^https?:\/\/review\.openstack\.org\/(#\/c\/)?(\d*)\/?(\d*)?\/?$/.exec(url);

        if(!matches_url) return;
        const change_id = matches_url[2];
        var change_ver = matches_url[3];

        if (typeof change_ver === "undefined"){
            // eslint-disable-next-line no-undef
            change_ver = ci_latest_patchset(ci_parse_comments());
        }

        for(var zuul in zuul_servers) {

            var zuul_status_base = zuul_servers[zuul]["zuul_status_base"];
            var status_url = zuul_status_base + zuul_servers[zuul]["zuul_api"] + change_id + "," + change_ver;

            // eslint-disable-next-line no-undef
            $.getJSON(status_url, (function() {
                var ii = zuul;
                return function(data) {
                    var queue;
                    var jobs = [];

                    if (data.length === 0){
                        // eslint-disable-next-line no-undef
                        if ($(".result_WARNING").length > 0){
                            location.reload();
                        }
                        return;
                    }
                    for(var i=0; i <= data.length; i++){
                        queue = data[i];
                        if(!queue) {
                            break;
                        }
                        if (queue.hasOwnProperty("items_behind") && queue.items_behind.length == 0){
                            break;
                        }
                    }
                    if (!queue){
                        // eslint-disable-next-line no-console
                        console.log("couldn't find a queue");
                        return;
                    }
                    // eslint-disable-next-line no-undef
                    $.each(queue.jobs, function(i, job) {
                        var item = {};

                        item.status = job.result ? job.result.toLowerCase() : (job.url ? "running" : "queued");
                        item.name = job.name;
                        item.voting = job.voting;
                        item.pipeline = job.pipeline;
                        item.url = job.result ? job.report_url : (job.url ? zuul_status_base + job.url : "#");

                        if (item.status === "running" && job.remaining_time !== null){
                            item.completeness = Math.round(100 * (job.elapsed_time / (job.elapsed_time + job.remaining_time))) + "%";
                        }
                        jobs.push(item);

                    });

                    jobs_dict[ii] = jobs;
                    setTimeout(main_loop, 10000, jobs_dict);

                };
            })());

        }
        render(jobs_dict);
    }; // main_loop


    // So we refresh on each update.

    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    // eslint-disable-next-line no-unused-vars
    var observer = new MutationObserver(function(mutations, observer) {
        // eslint-disable-next-line no-undef
        var span = $("span.rpcStatus");
        // eslint-disable-next-line no-undef
        $.each(mutations, function(i, mutation) {
            if (mutation.target === span[0] &&
                mutation.attributeName === "style" &&
                (!(span.is(":visible")))) {
                main_loop();
            }
        });
    });
    observer.observe(document, {
        subtree: true,
        attributes: true
    });

}

// load jQuery and execute the main function
addJQuery(main);
