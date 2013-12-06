# Genie.Controller

The `Genie.Controller` helper object is a simple wrapper around
`Marionette.Controller` which includes Genie's standard `app`, `mod`, and
`options` properties upon initialization.

A common use for a `controller` object is to use it in conjunction with an
assigned `router` to handle routing tasks, but it can be used much more
generally to keep operational logic outside of the core module code.

Further documentation and usage information can be found at
[Marionette.Controller](https://github.com/marionettejs/backbone.marionette/blob/master/docs/marionette.controller.md).

## Setup

As with all Genie helper objects, the `app` and `mod` properties are set via
option passing during instantiation by the parent Genie module and will be set
to the correct values automatically so long as the Controller is added in one
of the following ways:

*   As part of the Genie module's options
*   As a property of an extended Genie module
*   Using Genie's `addController()` method

An associated Controller object can be accessed via the module's `controller`
property.

Valid values for defining the controller are:

*   A Controller function (preferred)
    *   Usually generated via `Genie.Controller.extend()`
    *   Will be instantiated when the module is started
    *   Can recieve additional options when the module is started
*   An instantiated Controller Object
    *   Generated via JavaScript's `new` keyword, e.g. `new Genie.Controller()`
    *   Will **not** recieve any additional options when the module is started
*   `true`
    *   If `true` is passed as the `controller` option value an empty
        `Genie.Controller` object will be created and associated with the
        Genie module

### As an Option

```js
var myGenie = new Genie({
  controller: Genie.Controller.extend({
    initialize: function(options){
      alert(this.mod.moduleName + " says: Your wish is my command");
    }
  })
});

var App = new Marionette.Application();

App.module('MyGenie', myGenie);

App.start();
```

### As an Extended Property

```js
var MyGenie = Genie.extend({
  controller: Genie.Controller.extend({
    initialize: function(options){
      alert(this.mod.moduleName + " says: Your wish is my command");
    }
  })
});

var App = new Marionette.Application();

App.module('MyGenie', new ExtendedGenie());

App.start();
```

### Using addController()

#### Before Module Initialization

```js
var myGenie = new Genie();

var MyController = Genie.Controller.extend({
  initialize: function(options){
    alert(this.mod.moduleName + " says: Your wish is my command");
  }
});

myGenie.addController(MyController);

var App = new Marionette.Application();

App.module('MyGenie', myGenie);

App.start();
```

#### After Module Initialization

```js
var App = new Marionette.Application();

App.module("MyGenie", new Genie());

var MyController = Genie.Controller.extend({
  initialize: function(options){
    alert(this.mod.moduleName + " says: Your wish is my command");
  }
});

App.module("MyGenie").addController(MyController);

App.start();
```

**Note:** Controllers added after module initialization will not be
automatically tied to a module's already existing `router` instance.

Assigning the `router` object's controller after initialization can be
performed manually, but it's not recommended (and not specifically supported).
If your module is to contain both `router` and `controller` options they should
be assigned before initialization, or the router should be added after the
controller.

## Associated Options

When a controller is added to a Genie module object, aside from the
`controller` option, the following additional options may be provided to alter
the controller's initialization process:

*   `passStartOptionsToController` - boolean
*   `controllerOptions` - object

### Associated Option: passStartOptionsToController

If `passStartOptionsToController` is set to `true` the module's startup options
(usually the options passed to `App.start()`) will be passed to the controller
when it is initialized.

#### Example

```js
var MyGenie = Genie.extend({

  controller: Genie.Controller.extend({
    initialize: function(options){
      alert(
        this.mod.moduleName
        + " says: You wished for "
        + options.wish
        + "!"
      );
    }
  }),

  passStartOptionsToController: true

});

var App = new Marionette.Application();

App.module('MyGenie', new MyGenie());

App.start({
  wish: "one more wish, ad infinitum"
});
```

### Associated Option: controllerOptions

The `controllerOptions` option accepts an object containing options to be
passed to the controller upon initialization when the module is started.

If used in conjuntion with `passStartOptionsToController` the provided options
are merged with the module's startup options, overriding any startup options in
case of conflict.

If an initialized controller object is provided this option has no effect.

#### Example

```js
var MyGenie = Genie.extend({

  controller: Genie.Controller.extend({
    initialize: function(options){
      alert(
        this.mod.moduleName
        + " says: You wished for "
        + options.wish
        + "!"
      );
    }
  }),

  passStartOptionsToController: true,

  controllerOptions: {
    // This overrides the "wish" option in App.start()
    wish: "more wishes"
  }

});

var App = new Marionette.Application();

App.module('MyGenie', new MyGenie());

App.start({
  wish: "one more wish, ad infinitum"
});
```
