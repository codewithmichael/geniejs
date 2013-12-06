# Backbone.Marionette.Genie

## About GenieJS

Genie encapsulates the process of building portable and reusable Marionette
application modules, along with some commonly used helper objects and messaging
utilities.

Jump to the bottom of the readme for a [basic example](#basic-example) of usage.

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
wrapped `Backbone.Events` object, `Genie.Vent`, which is similar to the
`Backbone.Wreqr.EventAggregator` used by Marionette, but includes an
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

---

## Basic Example

The following example uses a `region` based Genie module and a simple template to populate two divs, dynamically loading each module's `moduleName` as part of the display content (via a `Marionette.ItemView` and a `Backbone.Model`).

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Script Libraries -->
    <script src="jquery.min.js"></script>
    <script src="underscore.min.js"></script>
    <script src="backbone.min.js"></script>
    <script src="backbone.marionette.min.js"></script>
    <script src="backbone.marionette.genie.min.js"></script>
  </head>
  <body>
    
    <!-- Module Rendering Regions -->
    <div id="mod1"></div>
    <div id="mod2"></div>
    
    <!-- Templates -->
    <script id="genie-template" type="text/template">
      <%= moduleName %> says: Your wish is my command
    </script>
    
    <!-- Genie-based Marionette Application -->
    <script>

      // Create a new application
      App = new Marionette.Application();

      // Create a generic view using #genie-template
      var MyView = Marionette.ItemView.extend({template: '#genie-template'});
    
      // Create a Genie
      var MyGenie = Genie.extend({
        
        // Include a local messaging system
        vent: true,
        
        // Map the local messaging system
        duct: Genie.Duct.extend({
          initialize: function(){
            // Map the module's "start" message to the local vent's "show" message
            // i.e. "start" on this.mod -> "show" on this.vent
            this.fromMod('start', 'show');
          }
        }),
        
        // Implement model logic
        controller: Genie.Controller.extend({
          
          initialize: function(){
            // Add local message listeners
            // Listen to this.duct.local (e.g. this.vent)
            this.listenLocal('show', this.show);
          },
          
          // Handler for the 'show' event message
          show: function(){
            // Prepare the view data
            var model = new Backbone.Model({moduleName: this.mod.moduleName});
            var view = new MyView({model: model});
            // Show the view in the model's region object
            this.mod.region.show(view);
          }

        }),
      });

      // Create Genie modules for the "#mod1" and "#mod2" divs
      App.module('Genie1', new MyGenie({region:'#mod1'}));
      App.module('Genie2', new MyGenie({region:'#mod2'}));

      // Start the application
      App.start();

    </script>
  </body>
</html>
```
