# Genie.Vent

The `Genie.Vent` object is a simple `Backbone.Events` wrapper, similar to the
`Backbone.Wreqr.EventAggregator` object used by Marionette. The primary
difference is that it includes an `initialize()` method to standardize the
object creation and initialization process.

Giving your module a dedicated Vent object allows for localized messaging
within a module, separate from the noisier application-wide messaging hub.

The `Genie.Vent` object is often used in conjunction with a `Genie.Duct` object
to filter and manage external comunication with the Marionette application's
`vent` object.

## Setup

As with all Genie helper objects, the `app` and `mod` properties are set via
option passing during instantiation by the parent Genie module and will be set
to the correct values automatically so long as the Vent is added in one of the
following ways:

*   As a property of an extended Genie module
*   As part of the Genie module's options
*   Using Genie's `addVent()` method

An associated Vent object can be accessed via the module's `vent` property.

Valid values for defining the vent are:

*   `true` (preferred)
    *   If `true` is passed as the `vent` option value an empty `Genie.Vent`
        object will be instantiated when the module is started and
        automatically associated with the Genie module
    *   This is usually the preferred means of adding a Vent, as a Vent doesn't
        usually require any specific code of its own -- messaging is primarily
        managed by other objects, like a Controller
    *   Can recieve additional options when the module is started
*   A Vent function (preferred if it requires `inialize()` code)
    *   Usually generated via `Genie.Vent.extend()`
    *   Will be instantiated when the module is started
    *   Can recieve additional options when the module is started
*   An instantiated Vent Object
    *   Generated via JavaScript's `new` keyword, e.g. `new Genie.Vent()`
    *   Will **not** recieve any additional options when the module is started

### As an Extended Property

```js
var MyGenie = Genie.extend({
  vent: true,
  initializer: function(){
    this.on('start', function(){
      this.vent.trigger('ready');
    });
  },
  controller: Genie.Controller.extend({
    initialize: function(){
      this.listenTo(this.mod.vent, 'ready', function(){
        console.log('controller: module has started and is ready');
      });
    }
  })
});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start();
```

### As an Option

```js
var myGenie = new Genie({
  vent: true,
  initializer: function(){
    this.on('start', function(){
      this.vent.trigger('ready');
    });
  },
  controller: Genie.Controller.extend({
    initialize: function(){
      this.listenTo(this.mod.vent, 'ready', function(){
        console.log('controller: module has started and is ready');
      });
    }
  })
});

var App = new Marionette.Application();

App.module("MyGenie", myGenie);

App.start();
```

### Using addVent()

**Note:** A Genie module can only have one object assigned to its `vent`
property at a time, so using `addVent()` overwrites any existing value.

#### Before Module Initialization

```js
var myGenie = new Genie({
  controller: Genie.Controller.extend({
    initialize: function(){
      this.listenTo(this.mod.vent, 'ready', function(){
        console.log('controller: module has started and is ready');
      });
    }
  })
});

var MyVent = Genie.Vent.extend({
  initialize: function(){
    this.listenTo(this.mod, 'start', function(){
      this.trigger('ready');
    });
  }
});

myGenie.addVent(MyVent);

var App = new Marionette.Application();

App.module("MyGenie", myGenie);

App.start();
```

#### After Module Initialization

```js
var App = new Marionette.Application();

var MyGenie = Genie.extend({
  controller: Genie.Controller.extend({
    ready: function(){
      console.log('controller: module has started and is ready');
    }
  })
});

App.module("MyGenie", new MyGenie());

// Start the application
App.start();

var MyVent = Genie.Vent.extend({
  initialize: function(){
    this.listenTo(this.app.vent, 'done', this.mod.controller.ready);
  }
});

App.module("MyGenie").addVent(MyVent);

App.vent.trigger('done');
```

**Note:** Vents added after a module has started will not be automatically tied
to a module's already existing `duct` instance.

Assigning the `duct` object's local vent after a module has started can be
performed manually, but it's not recommended (and not specifically supported).
If your module is to contain both `duct` and `vent` options they should
be assigned before the module is started, or the duct should be added after
the vent.

## Associated Options

When a vent is added to a Genie module object, aside from the `vent` option,
the following additional options may be provided to the Genie object to alter
the vent's initialization process:

*   `passStartOptionsToVent` - boolean
*   `ventOptions` - object

### Associated Option: passStartOptionsToVent

If `passStartOptionsToVent` is set to `true` the module's startup options
(usually the options passed to `App.start()`) will be passed to the vent when
it is initialized.

#### Example

```js
var MyGenie = Genie.extend({

  vent: Genie.Vent.extend({
    initialize: function(options){
      this.listenTo(this.app.vent, options.readyMessage, function(){
        this.trigger('ready');
      });
    }
  }),

  passStartOptionsToVent: true,

  controller: Genie.Controller.extend({
    initialize: function(){
      this.listenTo(this.mod.vent, 'ready', function(){
        console.log('controller: module has been notified of ready state');
      });
    }
  })
});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start({
  readyMessage: 'ding'
});

App.vent.trigger('ding');
```

### Associated Option: ventOptions

The `ventOptions` option accepts an object containing options to be passed to
the vent upon initialization when the module is started.

If used in conjuntion with `passStartOptionsToVent` the provided options are
merged with the module's startup options, overriding any startup options in
case of conflict.

If an initialized vent object is provided this option has no effect.

#### Example

```js
var MyGenie = Genie.extend({

  vent: Genie.Vent.extend({
    initialize: function(options){
      this.listenTo(this.app.vent, options.readyMessage, function(){
        this.trigger('ready');
      });
    }
  }),

  passStartOptionsToVent: true,

  ventOptions: {
    // This overrides the "readyMessage" option from App.start()
    readyMessage: 'dong'
  },

  controller: Genie.Controller.extend({
    initialize: function(){
      this.listenTo(this.mod.vent, 'ready', function(){
        console.log('controller: module has started and is ready');
      });
    }
  })
});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start({
  readyMessage: 'ding'
});

App.vent.trigger('dong');
```
