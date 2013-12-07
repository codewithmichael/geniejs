// GenieJS (Backbone.Marionette.Genie)
// -----------------------------------
// v0.3.6
// 
// Copyright (c) 2013 Michael Spencer, Trynd, LLC
// Distributed under the MIT license
//
// http://github.com/xmxspencer/geniejs

(function(Backbone, Marionette, _) {
  "use strict";

  var Controller, Duct, Genie, Region, Router, Vent, helperConstructor,
    listenLocal, listenRemote, moduleFunctions, parseOptions, previousGenie,
    previousMarionetteGenie, root;

  // Existing environment status
  root = this;
  previousGenie = root.Genie;
  previousMarionetteGenie = Marionette.Genie;

  // Genie Core
  // ----------

  // Genie constructor
  Genie = function(options) {
    this.options = _.extend({}, options);
    this.parseOptions(this.options, this.validOptions);
    this.processOptions(this.options);
    this.define = this.createDefine(this.options);
    if (_.isFunction(this.initialize)) {
      this.initialize(options);
    }
    return this;
  };

  // Valid Genie options
  Genie.prototype.validOptions = [
    'startWithParent',
    'initializer',
    'vent',
    'duct',
    'region',
    'regions',
    'controller',
    'router',
    'passStartOptionsToVent',
    'passStartOptionsToDuct',
    'passStartOptionsToRegion',
    'passStartOptionsToController',
    'passStartOptionsToRouter',
    'ventOptions',
    'ductOptions',
    'regionOptions',
    'controllerOptions',
    'routerOptions'
  ];

  // Combine passed in options and extended fields
  // Modified the "options" object
  Genie.prototype.parseOptions = parseOptions = function(options, validOptions)
  {
    if (_.isObject(options)) {
      var i, len, option;
      for (i = 0, len = validOptions.length; i < len; i++) {
        option = validOptions[i];
        if (!(option in options)) {
          if (option in this) {
            options[option] = this[option];
          }
        }
      }
    } else {
      options = {};
    }
    return options;
  };

  // Handle any module callback object fields
  // Modifies the "options" object
  Genie.prototype.processOptions = function(options) {
    if ('startWithParent' in options) {
      this.startWithParent = options.startWithParent;
    } else {
      this.startWithParent = true;
    }
    return options;
  };

  // Prepare options for creating a helper class by merging various option sets
  Genie.prototype.mergeHelperClassOptions = function(requiredOptions,
    customOptions, passStartOptions, startOptions)
  {
    var options = {};
    if (passStartOptions === true) {
      _.extend(options, startOptions);
    }
    _.extend(options, requiredOptions);
    if (_.isObject(customOptions)) {
      _.extend(options, customOptions);
    }
    return options;
  };

  // Create the module callback object define() based on Genie options
  Genie.prototype.createDefine = function() {

    var genie = this;

    return function() {

      // Retain a reference to the Genie object
      this.genie = genie;

      // Retain a self reference for consistency
      this.mod = this;

      // Incorporate Genie module functions
      _.extend(this, moduleFunctions);
      this.listenLocal = listenLocal;
      this.listenRemote = listenRemote;

      // Add the module's initializer
      return this.addInitializer(function(startOptions) {

        var genieOptions;

        genieOptions = genie.options;

        // store initialization options
        this.startOptions = startOptions;

        // Create Vent
        if ('vent' in genieOptions) {
          this.addVent(genieOptions.vent);
        }

        // Create Duct
        if ('duct' in genieOptions) {
          this.addDuct(genieOptions.duct);
        }

        // Create Regions
        if ('region' in genieOptions) {
          this.addRegion('region', genieOptions.region);
        }
        if ('regions' in genieOptions) {
          this.addRegions(genieOptions.regions);
        }

        // Create Controller
        if ('controller' in genieOptions) {
          this.addController(genieOptions.controller);
        }

        // Create Router
        if ('router' in genieOptions) {
          this.addRouter(genieOptions.router);
        }

        // Run custom initializer
        if ('initializer' in genieOptions) {
          genieOptions.initializer.apply(this, arguments);
        }

        return this;
      });
    };
  };

  // Genie module functions
  moduleFunctions = {

    // Set a Controller on the module
    addController: function(definition, options) {

      if (definition != null && definition !== false) {

        var controller;

        // A definition of true instantiates a new Controller object
        if (definition === true) {
          definition = Controller;
        }

        // A function definition instantiates a new function instance
        if (_.isFunction(definition)) {
          options = this.genie.mergeHelperClassOptions(
            {
              app: this.app,
              mod: this
            },
            _.isObject(options)
              ? options
              : this.genie.options.controllerOptions,
            this.genie.options.passStartOptionsToController,
            this.startOptions
          );
          controller = new definition(options);
        } else {
          controller = definition;
        }

        return this.controller = controller;
      }
      return;
    },
  
    // Set a Duct on the module
    addDuct: function(definition, options) {

      if (definition != null && definition !== false) {

        var duct;

        // A definition of true instantiates a new Duct object
        if (definition === true) {
          definition = Duct;
        }

        // A function definition instantiates a new function instance
        if (_.isFunction(definition)) {
          options = this.genie.mergeHelperClassOptions(
            {
              app: this.app,
              mod: this
            },
            _.isObject(options) ? options : this.genie.options.ductOptions,
            this.genie.options.passStartOptionsToDuct,
            this.startOptions
          );
          duct = new definition(options);
        } else {
          duct = definition;
        }

        return this.duct = duct;
      }
      return;
    },

    // Add a Region to the module
    addRegion: function(name, definition, options) {

      if (!_.isString(name)) {
        options = definition;
        definition = name;
        name = 'region';
      }

      if (name != null && definition != null) {

        var isFunction, isString, region;

        // If the definition is an array, assume a definition and options
        if (_.isArray(definition)) {
          if (!_.isObject(options)) {
            options = definition[1];
          }
          definition = definition[0];
        }

        // Do nothing if defined as false
        if (definition !== false) {

          isString = _.isString(definition);
          isFunction = !isString && _.isFunction(definition);

          if (!('regions' in this)) {
            this.regions = {};
          }

          if (isString || isFunction) {
            options = this.genie.mergeHelperClassOptions(
              {
                app: this.app,
                mod: this
              },
              _.isObject(options) ? options : this.genie.options.regionOptions,
              this.genie.options.passStartOptionsToRegion,
              this.startOptions
            );

            if (isString) {
              options.el = definition;
              region = new Region(options);
            } else {
              region = new definition(options);
            }
          } else {
            region = definition;
          }

          this.regions[name] = region;
          if (name === 'region') {
            this.region = region;
          }

          return region;
        }
      }
      return;
    },

    // Add multiple Regions to the module
    addRegions: function(definitions) {
      if (_.isObject(definitions)) {
        _.each(definitions, function(region, name) {
          this.addRegion(name, region);
        }, this);
      }
      return;
    },

    // Set a Router on the module
    addRouter: function(definition, options) {

      if (definition != null && definition !== false) {

        var router;

        // A definition of true instantiates a new Router object
        if (definition === true) {
          definition = Router;
        }

        // A function definition instantiates a new function instance
        if (_.isFunction(definition)) {
          options = this.genie.mergeHelperClassOptions(
            {
              app: this.app,
              mod: this
            },
            _.isObject(options) ? options : this.genie.options.routerOptions,
            this.genie.options.passStartOptionsToRouter,
            this.startOptions
          );

          // If the module already has a Controller and one has not been
          // specified in the options, pass the module's controller to the new
          // Router
          if (_.isObject(this.controller) && !('controller' in options)) {
            options.controller = this.controller;
          }

          router = new definition(options);
        } else {
          router = definition;
        }

        return this.router = router;
      }
      return;
    },

    // Set a Vent on the module
    addVent: function(definition, options) {

      if (definition != null && definition !== false) {

        var vent;

        // A definition of true instantiates a new Vent object
        if (definition === true) {
          definition = Vent;
        }

        // A function definition instantiates a new function instance
        if (_.isFunction(definition)) {
          options = this.genie.mergeHelperClassOptions(
            {
              app: this.app,
              mod: this
            },
            _.isObject(options) ? options : this.genie.options.ventOptions,
            this.genie.options.passStartOptionsToVent,
            this.startOptions
          );
          vent = new definition(options);
        } else {
          vent = definition;
        }

        return this.vent = vent;
      }
      return;
    }

  };

  // Used to add a module initializer to the Genie object after instantiation
  Genie.prototype.addInitializer = function(initializer) {
    if (_.isFunction(initializer)) {
      if (!('initializer' in this.options)) {
        this.options.initializer = initializer;
      } else {
        var oldInitializer = this.options.initializer;
        this.options.initializer = function(){
          oldInitializer.apply(this, arguments);
          initializer.apply(this, arguments);
        };
      }
    }
  };

  // Used to add "controller" and "controllerOptions" options to the Genie
  // object after instantiation
  Genie.prototype.addController = function(definition, options) {
    if (definition != null) {
      this.options.controller = definition;
      if (_.isObject(options)) {
        this.options.controllerOptions = _.extend({}, options);
      }
    }
    return;
  }

  // Used to add "duct" and "ductOptions" options to the Genie object after
  // instantiation
  Genie.prototype.addDuct = function(definition, options) {
    if (definition != null) {
      this.options.duct = definition;
      if (_.isObject(options)) {
        this.options.ductOptions = _.extend({}, options);
      }
    }
    return;
  }

  // Used to add "region" or "regions" options to the Genie object after
  // instantiation
  Genie.prototype.addRegion = function(name, definition, options) {
    if (!_.isString(name)) {
      options = definition;
      definition = name;
      name = 'region';
    }
    var region = definition;
    if (_.isObject(options)) {
      if (_.isArray(region)) {
        region = [region[0], _.extend({}, options)];
      } else {
        region = [region, _.extend({}, options)];
      }
    }
    if (name === 'region') {
      this.options.region = region;
    } else {
      if (!('regions' in this.options)) {
        this.options.regions = {};
      }
      this.options.regions[name] = region;
    }
    return;
  }

  // Used to add "region" or "regions" options to the Genie object after
  // instantiation
  Genie.prototype.addRegions = function(definitions) {
    if (_.isObject(definitions)) {
      _.each(definitions, function(region, name) {
        this.addRegion(name, region);
      }, this);
    }
    return;
  }

  // Used to add "router" and "routerOptions" options to the Genie object after
  // instantiation
  Genie.prototype.addRouter = function(definition, options) {
    if (definition != null) {
      this.options.router = definition;
      if (_.isObject(options)) {
        this.options.routerOptions = _.extend({}, options);
      }
    }
    return;
  }

  // Used to add "vent" and "ventOptions" options to the Genie object after
  // instantiation
  Genie.prototype.addVent = function(definition, options) {
    if (definition != null) {
      this.options.vent = definition;
      if (_.isObject(options)) {
        this.options.ventOptions = _.extend({}, options);
      }
    }
    return;
  }

  // Inherit standard Backbone object extend() functionality
  Genie.extend = Backbone.Model.extend;

  // Set the environment's "Genie" back to its previous value and return Genie
  Genie.noConflict = function() {
    root.Genie = previousGenie;
    return this;
  };

  // Set Marionette.Genie back to its default status and return Genie
  Genie.noConflictMarionette = function() {
    Marionette.Genie = previousMarionetteGenie;
    return this;
  };

  // Helper Objects
  // --------------

  // Helper class constructor
  // Inherit standard option fields
  helperConstructor = function(options) {
    if (_.isObject(options)) {
      this.options = _.extend({}, options);
      if ('app' in options) {
        this.app = options.app;
      }
      if ('mod' in options) {
        this.mod = options.mod;
      }
    }
    return this;
  };

  // Vent
  // ----
  // An event aggregator with initialize() functionality

  // Vent constructor
  Genie.Vent = Vent = function(options) {
    helperConstructor.apply(this, arguments);
    if (_.isFunction(this.initialize)) {
      this.initialize(options);
    }
    return this;
  };

  // Inherit extend() functionality
  Vent.extend = Genie.extend;

  // Inherit Backbone.Events functionality
  _.extend(Vent.prototype, Backbone.Events);

  // Duct
  // ----
  // Connects two Vent objects, mapping events between them

  // Duct constructor
  Genie.Duct = Duct = function(options) {
    helperConstructor.apply(this, arguments);
    this.options = this.parseOptions(this.options, this.validOptions);
    if (!('local' in this.options)) {
      if (_.isObject(this.mod)) {
        this.options.local = this.mod.vent;
      }
    }
    if (!('remote' in this.options)) {
      if (_.isObject(this.app)) {
        this.options.remote = this.app.vent;
      }
    }
    this.local = this.options.local;
    this.remote = this.options.remote;
    if (_.isFunction(this.initialize)) {
      this.initialize(options);
    }
    return this;
  };

  // Valid Duct options
  Duct.prototype.validOptions = [
    'local',
    'remote'
  ];

  // Inherit Genie's standard option parsing
  Duct.prototype.parseOptions = parseOptions;

  // Map messages from one Vent object to another
  Duct.prototype.map = function(source, destination, sourceMessage,
    destinationMessage, mapper, mapperContext)
  {
    if (sourceMessage != null) {
      if (destinationMessage == null) {
        destinationMessage = sourceMessage;
      }
      return this.listenTo(source, sourceMessage, function() {
        var args;
        args = arguments;
        if (_.isFunction(mapper)) {
          if (mapperContext == null) {
            mapperContext = this;
          }
          args = mapper.apply(mapperContext, args);
        }
        if (args === true) {
          args = arguments;
        } else if (args === false) {
          return;
        }
        if (!(_.isArguments(args) || _.isArray(args))) {
          return;
        }
        return destination.trigger.apply(destination,
          [destinationMessage].concat(Array.prototype.slice.call(args)));
      });
    }
    return;
  };

  // Map a message from the remote Vent object to the local one
  Duct.prototype.in = function(remoteMessage, localMessage, mapper,
    mapperContext)
  {
    return this.map(this.remote, this.local, remoteMessage, localMessage,
      mapper, mapperContext);
  };

  // Map a message from the local Vent object to the remote one
  Duct.prototype.out = function(localMessage, remoteMessage, mapper,
    mapperContext)
  {
    return this.map(this.local, this.remote, localMessage, remoteMessage,
      mapper, mapperContext);
  };

  // Map a message from the defined "app" Application object to the local vent
  Duct.prototype.fromApp = function(appMessage, localMessage, mapper,
    mapperContext)
  {
    return this.map(this.app, this.local, appMessage, localMessage,
      mapper, mapperContext);
  };

  // Map a message from the defined "mod" Module object to the local vent
  Duct.prototype.fromMod = function(modMessage, localMessage, mapper,
    mapperContext)
  {
    return this.map(this.mod, this.local, modMessage, localMessage,
      mapper, mapperContext);
  };

  // Map one local message to another local message
  Duct.prototype.fromLocal = function(firstMessage, secondMessage, mapper,
    mapperContext)
  {
    return this.map(this.local, this.local, firstMessage, secondMessage,
      mapper, mapperContext);
  };

  // Map a message on the local vent to a callback
  Duct.prototype.listenLocal = function(message, callback, context){
    if (!!this.local) {
      return this.listenTo(this.local, message, callback, context);
    }
    throw 'local vent not defined';
  };

  // Map a message on the remote vent to a callback
  Duct.prototype.listenRemote = function(message, callback, context){
    if (!!this.remote) {
      return this.listenTo(this.remote, message, callback, context);
    }
    throw 'remote vent not defined';
  };

  // Inherit extend() functionality
  Duct.extend = Genie.extend;

  // Inherit Backbone.Events functionality
  _.extend(Duct.prototype, Backbone.Events);

  // Region
  // ------

  // Region constructor
  Genie.Region = Region = Marionette.Region.extend({
    constructor: function() {
      helperConstructor.apply(this, arguments);
      Marionette.Region.apply(this, arguments);
      return this;
    }
  });

  // Controller
  // ----------

  // Controller constructor
  Genie.Controller = Controller = Marionette.Controller.extend({
    constructor: function() {
      helperConstructor.apply(this, arguments);
      Marionette.Controller.apply(this, arguments);
      return this;
    }
  });

  // Router
  // ------

  // Router constructor
  Genie.Router = Router = Marionette.AppRouter.extend({
    constructor: function() {
      helperConstructor.apply(this, arguments);
      Marionette.AppRouter.apply(this, arguments);
      return this;
    }
  });

  // Helper Methods
  // --------------

  // listenLocal()
  listenLocal = function(message, callback, context){
    var target;
    if (this.mod != null) {
      if (this.mod.duct != null) {
        if (this.mod.duct.local != null) {
          target = this.mod.duct.local;
        }
      } else if (this.mod.vent != null) {
        target = this.mod.vent;
      }
    }
    if (!!target) {
      return this.listenTo(target, message, callback, context);
    }
    throw 'local vent not defined';
  };

  // listenRemote()
  listenRemote = function(message, callback, context){
    var target;
    if (this.mod != null && this.mod.duct != null) {
      if (this.mod.duct.remote != null) {
        target = this.mod.duct.remote;
      }
    } else if (this.app != null && this.app.vent != null) {
      target = this.mod.vent;
    }
    if (!!target) {
      return this.listenTo(target, message, callback, context);
    }
    throw 'remote vent not defined';
  };

  // Map listen* methods
  _.each([Vent, Region, Controller, Router], function(helper){
    helper.prototype.listenLocal = listenLocal;
    helper.prototype.listenRemote = listenRemote;
  });

  // Export to applicable namespaces
  return root.Genie = Marionette.Genie = Genie;

}).call(this, Backbone, Backbone.Marionette, _);
