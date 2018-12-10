# coats

Collection of scripts (coats) that improve open-stack developer browsing experience

## Current scripts

### FoxReplace.json

FoxReplace.json is text replacements configuration for
<https://addons.mozilla.org/en-GB/firefox/addon/foxreplace/> which would add
some extra coloring on build logs, making them easier to read. We plan to
convert this into a greasemonkey helper in the future to allow use from
multiple browsers.

![foxreplace-os-logs](https://raw.githubusercontent.com/openstack/coats/master/doc/source/_static/img/coats-log-highlight-example.png)

After you install Firefox extension you can either do an one-time import
of the configuration from <https://raw.githubusercontent.com/openstack/coats/master/coats/FoxReplace.json>
or configure it to re-download it when it changes.

### openstack_gerrit_zuul_status.user.js

**openstack_gerrit_zuul_status.user.js**: Provides the status of the current CI run on the OpenStack Gerrit in real time.

## Ideas for future scripts

- Link codesearch.openstack.org results directly to github.com

## Context search for Firefox

If you often have to search for pieces of OpenStack related code on various
websites you may find useful to use [Context Search Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/contextual-search/) that
allows you to perform context searches. You can import the configuration from
``coats/searchEngines.json``

![coats-log-highlight-example](https://raw.githubusercontent.com/openstack/coats/master/doc/source/_static/img/coats-log-highlight-example.png)

## Contributing

Before you raise a CR, please run "tox" to perform a sanity check.
