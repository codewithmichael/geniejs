# Genie.Duct

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

A `Genie.Duct` may also be used in a standalone context to tie any two
`Backbone.Event` based objects together by defining them as the `local` and
`remote` options when creating a new Duct object.

In the more common module context, by default `local` refers to the module's `vent` object and `remote` refers to the application's `vent` object.

## Setup

As with all Genie helper objects, the `app` and `mod` properties are set via
option passing during instantiation by the parent Genie module and will be set
to the correct values automatically so long as the Duct is added in one of the
following ways:

*   As a property of an extended Genie module
*   As part of the Genie module's options
*   Using Genie's `addDuct()` method

An associated Duct object can be accessed via the module's `duct` property.

Valid values for defining the duct are:

*   A Duct function (preferred)
    *   Usually generated via `Genie.Duct.extend()`
    *   Will be instantiated when the module is started
    *   Can recieve additional options when the module is started
*   `true`
    *   If `true` is passed as the `duct` option value an empty `Genie.Duct`
        object will be instantiated when the module is started and
        automatically associated with the Genie module
    *   Can recieve additional options when the module is started
*   An instantiated Duct Object
    *   Generated via JavaScript's `new` keyword, e.g. `new Genie.Duct()`
    *   Will **not** recieve any additional options when the module is started

### As an Extended Property

```js
var MyGenie = Genie.extend({

  // A Vent is required to use a standard module-based Duct
  vent: true,

  duct: Genie.Duct.extend({
    initialize: function(){
      // Trigger a local "ready" message on module start.
      // Unless otherwise defined, "local" refers to this.mod.vent
      this.fromMod("start", "ready");
    }
  }),

  initializer: function(){
    // Listen for a local "ready" message
    this.listenLocal("ready", function(){
      console.log("This Genie's ready... start your wishes");
    });
  }

});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start();
```

### As an Option

```js
var myGenie = new Genie({

  // A Vent is required to use a standard module-based Duct
  vent: true,

  duct: Genie.Duct.extend({
    initialize: function(){
      // Trigger a local "ready" message on module start.
      // Unless otherwise defined, "local" refers to this.mod.vent
      this.fromMod("start", "ready");
    }
  }),

  initializer: function(){
    // Listen for a local "ready" message
    this.listenLocal("ready", function(){
      console.log("This Genie's ready... start your wishes");
    });
  }

});

var App = new Marionette.Application();

App.module("MyGenie", myGenie);

App.start();
```

### Using addDuct()

**Note:** A Genie module can only have one object assigned to its `duct`
property at a time, so using `addDuct()` overwrites any existing value.

#### Before Module Initialization

```js
var myGenie = new Genie({

  // A Vent is required to use a standard module-based Duct
  vent: true,

  initializer: function(){
    // Listen for a local "ready" message
    this.listenLocal("ready", function(){
      console.log("This Genie's ready... start your wishes");
    });
  }

});

var MyDuct = Genie.Duct.extend({
  initialize: function(){
    // Trigger a local "ready" message on module start.
    // Unless otherwise defined, "local" refers to this.mod.vent
    this.fromMod("start", "ready");
  }
});

myGenie.addDuct(MyDuct);

var App = new Marionette.Application();

App.module("MyGenie", myGenie);

App.start();
```

#### After Module Initialization

```js
var App = new Marionette.Application();

var MyGenie = Genie.extend({

  vent: true,

  initializer: function(){
    // Listen for a local "ready" message
    this.listenLocal("ready", function(){
      console.log("This Genie's ready... start your wishes");
    });
  }

});

App.module("MyGenie", new MyGenie());

// Start up the application
App.start();

var MyDuct = Genie.Duct.extend({
  initialize: function(){
    // Trigger a local "ready" message on remote "done".
    // Unless otherwise defined, "local" refers to this.mod.vent
    // Unless otherwise defined, "remote" refers to this.app.vent
    this.in("done", "ready");
  }
});

App.module("MyGenie").addDuct(MyDuct);

App.vent.trigger("done");
```

## Associated Options

When a duct is added to a Genie module object, aside from the `duct` option
(and the required vents), the following additional options may be provided to
the Genie object to alter the duct's initialization process:

*   `passStartOptionsToDuct` - boolean
*   `ductOptions` - object

### Associated Option: passStartOptionsToDuct

If `passStartOptionsToDuct` is set to `true` the module's startup options
(usually the options passed to `App.start()`) will be passed to the duct when
it is initialized.

#### Example

```js
var MyGenie = Genie.extend({

  // A Vent is required to use a standard module-based Duct
  vent: true,

  duct: Genie.Duct.extend({
    initialize: function(options){
      // Trigger a local "ready" message on module start.
      // Unless otherwise defined, "local" refers to this.mod.vent
      this.in(options.remoteMessage, "ready");
    }
  }),

  passStartOptionsToDuct: true,

  initializer: function(){
    // Listen for a local "ready" message
    this.listenLocal("ready", function(){
      console.log("This Genie's ready... start your wishes");
    });
  }

});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start({
  remoteMessage: "done"
});

App.vent.trigger("done");
```

### Associated Option: ductOptions

The `ductOptions` option accepts an object containing options to be passed to
the duct upon initialization when the module is started.

If used in conjuntion with `passStartOptionsToDuct` the provided options are
merged with the module's startup options, overriding any startup options in
case of conflict.

If an initialized duct object is provided this option has no effect.

#### Example

```js
var MyGenie = Genie.extend({

  // A Vent is required to use a standard module-based Duct
  vent: true,

  duct: Genie.Duct.extend({
    initialize: function(options){
      // Trigger a local "ready" message on module start.
      // Unless otherwise defined, "local" refers to this.mod.vent
      this.in(options.remoteMessage, "ready");
    }
  }),

  passStartOptionsToDuct: true,

  ductOptions: {
    // This option overrides "remoteMessage" from App.start()
    remoteMessage: "fire"
  },

  initializer: function(){
    // Listen for a local "ready" message
    this.listenLocal("ready", function(){
      console.log("This Genie's ready... start your wishes");
    });
  }

});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start({
  remoteMessage: "done"
});

App.vent.trigger("fire");
```
