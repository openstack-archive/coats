# coats

Collection of scripts (coats) that improve open-stack developer browsing experience

FoxReplace.json is text replacements configuration for
<https://addons.mozilla.org/en-GB/firefox/addon/foxreplace/> which would add
some extra coloring on build logs, making them easier to read. We plan to
convert this into a greasemonkey helper in the future to allow use from
multiple browsers.

![foxreplace-os-logs](https://raw.githubusercontent.com/openstack/coats/master/doc/source/_static/img/coats-log-highlight-example.png)

After you install Firefox extension you can either do an one-time import
of the configuration from <https://raw.githubusercontent.com/openstack/coats/master/coats/FoxReplace.json>
or configure it to re-download it when it changes.

## Contributing

Before you raise a CR, please run "tox" to perform a sanity check.
