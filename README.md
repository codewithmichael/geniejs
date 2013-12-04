# Backbone.Marionette.Genie

## About Genie

Genie encapsulates the process of building portable and reusable Marionette
application modules, along with some commonly used helper objects and messaging
utilities.

### Modular Architecture

While Genie enforces no hard and fast rules, its design encourages
module-centric development, allowing for quicker, distributed application
development.

Putting the majority of your code in modules enables a simpler Marionette
application object with the simpler scope of orchestrating the life cycle of
task-specific modules, acting primarily as a central communication hub.

### Wrapped Marionette Objects

*   Genie.Region
*   Genie.Controller
*   Genie.Router

Genie wraps some commonly used Backbone and Marionette framework components to
provide a common property set across components tied to the same module and
enable easier cross-communication.

Wrapped versions of Marionette's Region (Genie.Region), Controller
(Genie.Controller), and AppRouter (Genie.Router) objects can be instantiated as
part of the module creation process.

### Messaging Objects

*   Genie.Vent
*   Genie.Duct

#### Genie.Vent

In addition to the standard Marionette objects, Genie also incorporates a
wrapped Backbone.Events object, `Genie.Vent`, which is similar to the
Backbone.Wreqr.EventAggregator used by Marionette, but includes an
`initialize()` method to standardize the object creation process.

Giving a module a dedicated Vent object allows for localized messaging within a
module, separated from the noisier application-wide messaging hub.

#### Genie.Duct

In order to facilitate external communications, as well as filter and translate
incomming and outgoing messages, Genie based modules optionally provide an
event mapper, `Genie.Duct`, which ties two Vent objects together.

Event messages from a remote Vent -- the Marionette.Application.vent object by
default -- can be mapped to trigger events on the module's local Vent, and
select local events can be passed out to the remote (shared) Vent.

Additionally, events can be defined with an optional *mapper* function and
context. The mapper can be used to alter or translate argument sets, or as a
filter to stop individual message transmission all together (by returning
`false` from the mapper).

## Documentation

See the `/docs` folder for documentation on Genie and its components.

## Compatability and Requirements

GenieJS is currently working with:

*   [Underscore](http://underscorejs.org/) v1.4.4+
*   [Backbone](http://backbonejs.org) v1.0+
*   [Marionette](http://marionettejs.com) v1.1.0+

## MIT License

Copyright (c) 2013 Michael Spencer; Trynd, LLC

Distributed under the MIT License.
