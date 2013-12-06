# Genie.Region

The `Genie.Region` helper object is a simple wrapper around
`Marionette.Region` which includes Genie's standard `app`, `mod`, and `options`
properties upon initialization.

A `region` object is primarily used to define an area of the page in which to
present (render) `Backbone.View` based objects, such as a
`Marionette.ItemView` or `Marionette.Layout`, via jQuery.

Further documentation and usage information can be found at
[Marionette.Region](https://github.com/marionettejs/backbone.marionette/blob/master/docs/marionette.region.md).

## Setup

As with all Genie helper objects, the `app` and `mod` properties are set via
option passing during instantiation by the parent Genie module and will be set
to the correct values automatically so long as the Region is added in one
of the following ways:

*   As part of the Genie module's options
*   As a property of an extended Genie module
*   Using Genie's `addRegion()` method
*   Using Genie's `addRegions()` method

Associated Region objects can be accessed on the module via either the
`region` or `regions` property.

Valid values for defining the region are:

*   A Region function (preferred)
    *   Usually generated via `Genie.Region.extend()`
    *   Will be instantiated when the module is started
    *   Can recieve additional options when the module is started
*   An instantiated Region Object
    *   Generated via JavaScript's `new` keyword, e.g.
        `new Genie.Region({el: "#main"})`
    *   Will **not** recieve any additional options when the module is started
*   A page element selector string
    *   i.e. `"#main"`
    *   If an element selector string is passed as the `region` option value an
        empty `Genie.Region` object will be created, passing the selector string
        as the Region's `el` option, and associated with the Genie module

### As an Option

#### Option: region

```js
var MyView = Marionette.ItemView.extend({
  template: _.template("Don't wish for <%= wish %>")
});

var myGenie = new Genie({
  region: Genie.Region.extend({
    el: "#main",
    initialize: function(){
      var myModel = new Backbone.Model({wish: "more wishes"});
      var myView = new MyView({model: myModel});
      this.show(myView);
    }
  })
});

var App = new Marionette.Application();

App.module("MyGenie", myGenie);

App.start();
```

#### Option: regions

```js
var MyView = Marionette.ItemView.extend({
  template: _.template("Don't wish for <%= wish %>")
});

var myGenie = new Genie({
  regions: {
    region1: ["#rule1", {wish: "more wishes"}],
    region2: ["#rule2", {wish: "another Genie"}]
  },
  controller: Genie.Controller.extend({
    initialize: function(){
      _.each(this.mod.regions, function(region){
        var myModel = new Backbone.Model({wish: region.options.wish});
        var myView = new MyView({model: myModel});
        region.show(myView);
      });
    }
  })
});

var App = new Marionette.Application();

App.module("MyGenie", myGenie);

App.start();
```

### As an Extended Property

#### Property: region

```js
var MyView = Marionette.ItemView.extend({
  template: _.template("Don't wish for <%= wish %>")
});

var MyGenie = Genie.extend({
  region: Genie.Region.extend({
    el: "#main",
    initialize: function(){
      var myModel = new Backbone.Model({wish: "more wishes"});
      var myView = new MyView({model: myModel});
      this.show(myView);
    }
  })
});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start();
```

#### Property: regions

```js
var MyView = Marionette.ItemView.extend({
  template: _.template("Don't wish for <%= wish %>")
});

var MyGenie = Genie.extend({
  regions: {
    region1: ["#rule1", {wish: "more wishes"}],
    region2: ["#rule2", {wish: "another Genie"}]
  },
  controller: Genie.Controller.extend({
    initialize: function(){
      _.each(this.mod.regions, function(region){
        var myModel = new Backbone.Model({wish: region.options.wish});
        var myView = new MyView({model: myModel});
        region.show(myView);
      });
    }
  })
});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start();
```

### Using addRegion()

#### Definition

addRegion([name], definition, [options])

*   `name` - *OPTIONAL* - String used to define (and later find) the region
    object's property name under the module's `regions` property
    *   e.g. `App.module("MyModule").regions.myregion`
    *   If no name is given, or the name "region" is used, the region will also
        be avilable at `App.module("MyModule").region`
*   `definition` - *REQUIRED* - The Region function, object, or selector string
*   options - *OPTIONAL* - An object contaning the options to be passed to the
    Region when it's initialized
    *   This is ignored if an initialized Region object was provided as the
        `definition`
    *   This value overrides (replaces) any value defined by Genie's
        `regionOptions` option
    *   This value is merged with startup options when Genie's
        `passStartOptionsToRegion` is used

#### Before Module Initialization

```js
var myGenie = new Genie();

var MyView = Marionette.ItemView.extend({
  template: _.template("Don't wish for <%= wish %>")
});

var MyRegion = Genie.Region.extend({
  el: "#main",
  initialize: function(){
    var myModel = new Backbone.Model({wish: "more wishes"});
    var myView = new MyView({model: myModel});
    this.show(myView);
  }
});

myGenie.addRegion(MyRegion);

var App = new Marionette.Application();

App.module("MyGenie", myGenie);

App.start();
```

#### After Module Initialization

```js
var App = new Marionette.Application();

App.module("MyGenie", new Genie());

var MyView = Marionette.ItemView.extend({
  template: _.template("Don't wish for <%= wish %>")
});

var MyRegion = Genie.Region.extend({
  el: "#main",
  initialize: function(){
    var myModel = new Backbone.Model({wish: "more wishes"});
    var myView = new MyView({model: myModel});
    this.show(myView);
  }
});

App.module("MyGenie").addRegion(MyRegion);

App.start();
```

### Using addRegions()

#### Definition

addRegions(definitions)

*   `definitions` - *REQUIRED* - An object containing region definitions
    *   The object's property names will be used as the region names
    *   The value can be any value that would be valid to pass to `addRegion()`
    *   The value can also be an array in the format: `[definition, options]`
        *   The array values correlate to the `addRegion()` method's
            `definition` and `options` parameters

#### Before Module Initialization

```js
var myGenie = new Genie();

var MyView = Marionette.ItemView.extend({
  template: _.template("Don't wish for <%= wish %>")
});

var MyRegion = Genie.Region.extend({
  initialize: function(options){
    var myModel = new Backbone.Model({wish: options.wish});
    var myView = new MyView({model: myModel});
    this.show(myView);
  }
});

myGenie.addRegions({
  region1: [MyRegion, {el: "#rule1", wish: "more wishes"}],
  region2: [MyRegion, {el: "#rule2", wish: "another Genie"}]
});

var App = new Marionette.Application();

App.module("MyGenie", myGenie);

App.start();
```

#### After Module Initialization

```js
var App = new Marionette.Application();

App.module("MyGenie", new Genie());

var MyView = Marionette.ItemView.extend({
  template: _.template("Don't wish for <%= wish %>")
});

var MyRegion = Genie.Region.extend({
  initialize: function(options){
    var myModel = new Backbone.Model({wish: options.wish});
    var myView = new MyView({model: myModel});
    this.show(myView);
  }
});

App.module("MyGenie").addRegions({
  region1: [MyRegion, {el: "#rule1", wish: "more wishes"}],
  region2: [MyRegion, {el: "#rule2", wish: "another Genie"}]
});

App.start();
```

## Associated Options

When a region is added to a Genie module object, aside from the
`region` and `regions` options, the following additional options may be
provided to alter the regions' initialization process:

*   `passStartOptionsToRegion` - boolean
*   `regionOptions` - object

### Associated Option: passStartOptionsToRegion

If `passStartOptionsToRegion` is set to `true` the module's startup options
(usually the options passed to `App.start()`) will be passed to **all
associated regions** when they are initialized.

#### Example

```js
var MyView = Marionette.ItemView.extend({
  template: _.template("Don't wish for <%= wish %>")
});

var MyGenie = Genie.extend({

  region: Genie.Region.extend({
    el: "#main",
    initialize: function(options){
      var myModel = new Backbone.Model({wish: options.wish});
      var myView = new MyView({model: myModel});
      this.show(myView);
    }
  }),

  passStartOptionsToRegion: true

});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start({
  wish: "more wishes"
});
```

### Associated Option: regionOptions

The `regionOptions` option accepts an object containing options to be passed to
**all associated regions** upon initialization when the module is started.

If used in conjuntion with `passStartOptionsToRegion` the provided options
are merged with the module's startup options, overriding any startup options in
case of conflict.

If an initialized region object is provided this option has no effect.

If specific options are provided for a region, this option has no effect on
that region.

#### Example

```js
var MyView = Marionette.ItemView.extend({
  template: _.template("Don't wish for <%= wish %>")
});

var MyGenie = Genie.extend({

  region: Genie.Region.extend({
    el: "#main",
    initialize: function(options){
      var myModel = new Backbone.Model({wish: options.wish});
      var myView = new MyView({model: myModel});
      this.show(myView);
    }
  }),

  passStartOptionsToRegion: true,

  regionOptions: {
    // This overrides the "wish" option in App.start()
    wish: "another Genie"
  }

});

var App = new Marionette.Application();

App.module("MyGenie", new MyGenie());

App.start({
  wish: "more wishes"
});
```
