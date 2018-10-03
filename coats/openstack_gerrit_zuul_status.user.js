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

const zuul_status_base = "https://zuul.openstack.org/";
const zuul_status_url = zuul_status_base + "api/status/change/";

// /Config

// Script start

$('style#gerrit_sitecss').append('.result_RUNNING { color: #1e9ced; }');

var render = function(jobs) {
  var location = $('table.test_result_table');

  var table = '<tbody>' +
      '<tr>' +
      '<td class="header">Zuul check</td>' +
      '<td class="header ci_date result_WARNING">Still running</td>' +
      '</tr>';

  $.each(jobs, function(i, job) {
      var status_with_completeness = ((job.status === 'running' && typeof job.completeness !== 'undefined') ? 'RUNNING (' + job.completeness + ')' : job.status.toUpperCase());
      var voting = job.voting === true ? '' : '<small> (non-voting)</small>';

      table += '<tr>' +
      '<td><a href="' + job.url + '" rel="nofollow">' + job.name + '</a>' + voting + '</td>' +
      '<td><span class="comment_test_result"><span class="result_' + job.status.toUpperCase() +'">' + status_with_completeness + '</span></td>' +
      '</tr>';
  });

  table += '</tbody>';

  location.html(table);
};

var main = function() {
    const url = $(location).attr('href');
    const matches_url = /^https?:\/\/review\.openstack\.org\/(#\/c\/)?(\d*)\/?(\d*)?\/?$/.exec(url);

    const change_id = matches_url[2];
    var change_ver = matches_url[3];

    if (typeof change_ver === 'undefined'){
        change_ver = ci_latest_patchset(ci_parse_comments());
    }

    var status_url = zuul_status_url + change_id + ',' + change_ver;


    $.getJSON(status_url, function(data) {
        var queue;
        var jobs = [];

        if (data.length === 0){
          if ($('.result_WARNING').length > 0){
              location.reload();
          }
          return;
        }

        for(i=0; i <= data.length; i++){
          queue = data[i];
          if (queue.items_behind.length == 0){
              break;
          }
        }

        if (!queue){
            console.log("couldn't find a queue");
            return;
        }

        $.each(queue.jobs, function(i, job) {
            var item = {};

            item.status = job.result ? job.result.toLowerCase() : (job.url ? 'running' : 'queued');
            item.name = job.name;
            item.voting = job.voting
            item.pipeline = job.pipeline;
            item.url = job.result ? job.report_url : (job.url ? zuul_status_base + job.url : "#");

            if (item.status === 'running' && job.remaining_time !== null){
                item.completeness = Math.round(100 * (job.elapsed_time / (job.elapsed_time + job.remaining_time))) + '%';
            }

            jobs.push(item);

        });

        render(jobs);
        setTimeout(main, 2000);
    });
};


// So we refresh on each update.

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var observer = new MutationObserver(function(mutations, observer) {
  var span = $("span.rpcStatus");
  $.each(mutations, function(i, mutation) {
    if (mutation.target === span[0] &&
        mutation.attributeName === "style" &&
        (!(span.is(":visible")))) {
      main();
    }
  });
});
observer.observe(document, {
  subtree: true,
  attributes: true
});
