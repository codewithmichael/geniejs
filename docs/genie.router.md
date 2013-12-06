# Genie.Router

The `Genie.Router` helper object is a simple wrapper around
`Marionette.AppRouter` which includes Genie's standard `app`, `mod`, and
`options` properties upon initialization.

A `router` object is used to map routes, defined via the `routes` and
`appRoutes` options, to functions in the router or the associated
controller.

Further documentation and usage information can be found at
[Marionette.AppRouter](https://github.com/marionettejs/backbone.marionette/blob/master/docs/marionette.approuter.md).

## Setup

As with all Genie helper objects, the `app` and `mod` properties are set via
option passing during instantiation by the parent Genie module and will be set
to the correct values automatically so long as the Router is added in one
of the following ways:

*   As a property of an extended Genie module
*   As part of the Genie module's options
*   Using Genie's `addRouter()` method

An associated Router object can be accessed via the module's `router` property.

Valid values for defining the router are:

*   A Router function (preferred)
    *   Usually generated via `Genie.Router.extend()`
    *   Will be instantiated when the module is started
    *   Can recieve additional options when the module is started
*   `true`
    *   If `true` is passed as the `router` option value an empty
        `Genie.Router` object will be instantiated when the module is started
        and automatically associated with the Genie module
    *   Can recieve additional options when the module is started
*   An instantiated Router Object
    *   Generated via JavaScript's `new` keyword, e.g. `new Genie.Router()`
    *   Will **not** recieve any additional options when the module is started

### As an Extended Property

```js
var MyGenie = Genie.extend({
  router: Genie.Router.extend({
    routes: {
      "more-wishes": "showMoreWishes"
    },
    showMoreWishes: function(){
      $('body').append("<p>You wished for more wishes</p>");
      this.navigate('');
    }
  })
});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start();

Backbone.history.start();
```

### As an Option

```js
var myGenie = new Genie({
  router: Genie.Router.extend({
    routes: {
      "more-wishes": "showMoreWishes"
    },
    showMoreWishes: function(){
      $('body').append("<p>You wished for more wishes</p>");
      this.navigate('');
    }
  })
});

var App = new Marionette.Application();

App.module("MyGenie", myGenie);

App.start();

Backbone.history.start();
```

### Using addRouter()

**Note:** A Genie module can only have one object assigned to its `router`
property at a time, so using `addRouter()` overwrites any existing value.

#### Before Module Initialization

```js
var myGenie = new Genie();

var MyRouter = Genie.Router.extend({
  routes: {
    "more-wishes": "showMoreWishes"
  },
  showMoreWishes: function(){
    $('body').append("<p>You wished for more wishes</p>");
    this.navigate('');
  }
});

myGenie.addRouter(MyRouter);

var App = new Marionette.Application();

App.module("MyGenie", myGenie);

App.start();

Backbone.history.start();
```

#### After Module Initialization

```js
var App = new Marionette.Application();

App.module("MyGenie", new Genie());

var MyRouter = Genie.Router.extend({
  routes: {
    "more-wishes": "showMoreWishes"
  },
  showMoreWishes: function(){
    $('body').append("<p>You wished for more wishes</p>");
    this.navigate('');
  }
});

App.module("MyGenie").addRouter(MyRouter);

App.start();

Backbone.history.start();
```

**Note:** Routers added after module initialization or after a module has
started will attempt to inherit any assigned controller just as if they were
added before initialization. However, if the Controller is also to be added
after module startup it should be added before the Router to allow the Router
to inherit the instantiated Controller from the module.

## Associated Options

When a router is added to a Genie module object, aside from the
`router` option, the following additional options may be provided to alter
the router's initialization process:

*   `passStartOptionsToRouter` - boolean
*   `routerOptions` - object
*   `controller` - object or function

### Associated Option: passStartOptionsToRouter

If `passStartOptionsToRouter` is set to `true` the module's startup options
(usually the options passed to `App.start()`) will be passed to the router
when it is initialized.

#### Example

```js
var MyGenie = Genie.extend({

  router: Genie.Router.extend({
    showMoreWishes: function() {
      $('body').append("<p>You wished for more wishes</p>");
      this.navigate('');
    }
  }),

  passStartOptionsToRouter: true

});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start({
  routes: {
    "more-wishes": "showMoreWishes"
  }
});

Backbone.history.start();
```

### Associated Option: routerOptions

The `routerOptions` option accepts an object containing options to be passed to
the router upon initialization when the module is started.

If used in conjuntion with `passStartOptionsToRouter` the provided options
are merged with the module's startup options, overriding any startup options in
case of conflict.

If an initialized router object is provided this option has no effect.

#### Example

```js
var MyGenie = Genie.extend({

  router: Genie.Router.extend({
    showMoreWishes: function() {
      $('body').append("<p>You wished for more wishes</p>");
      this.navigate('');
    },
    showGreed: function() {
      $('body').append("<p>You got greedy</p>");
      this.navigate('');
    }
  }),

  passStartOptionsToRouter: true,

  routerOptions: {
    // This overrides the "routes" option in App.start()
    routes: {
      "more-wishes": "showGreed"
    }
  }

});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start({
  routes: {
    "more-wishes": "showMoreWishes"
  }
});

Backbone.history.start();
```

### Associated Option: controller

The `controller` option assigns a Controller object to the Genie module, and by
proxy also assigns the controller to an associated Router object if present.

This auto-association can be overridden by manually setting a `controller`
option on the Router directly or via `routerOptions`.

#### Example

```js
var MyGenie = Genie.extend({

  router: Genie.Router.extend({
    // Note: "appRoutes" are used in conjuntion with a Controller
    appRoutes: {
      "more-wishes": "showMoreWishes"
    },
  }),

  controller: Genie.Controller.extend({
    showMoreWishes: function(){
      $('body').append("<p>You wished for more wishes</p>");
      // Note: The router can be found via the parent module (this.mod)
      this.mod.router.navigate('');
    }
  })

});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start();

Backbone.history.start();
```
