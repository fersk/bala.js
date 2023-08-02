/*
 * bala.js v1.0.0
 * https://github.com/fersk/bala.js
 *
 * Copyright (c) 2023 Nuno F.
 * Released under the Apache 2.0 license
 */

var bala = {
  loadedScripts: {},
  loadingScripts: {},
  scriptOrder: [],

  load: function (scripts, callback) {
    var unloadedScripts = Object.keys(scripts).filter(name => !(name in this.loadedScripts) && !(name in this.loadingScripts));
    var loadPromises = unloadedScripts.map(name => this._loadSingleScript(name, scripts[name]));

    this.scriptOrder = this.scriptOrder.concat(unloadedScripts); // Store the script order

    Promise.all(loadPromises).then(callback).catch((err) => console.error(err));
  },

  _loadSingleScript: function (name, url, retries = 3) {
    if (this.loadedScripts[name]) {
      // If already loaded, return a resolved promise
      return Promise.resolve(name);
    }

    if (this.loadingScripts[name]) {
      // If it's currently being loaded, return the existing promise
      return this.loadingScripts[name];
    }

    // Load the script and store the promise
    var promise = new Promise((resolve, reject) => {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.async = false; // Load scripts synchronously to maintain order
      script.src = url;

      script.onload = () => {
        this.loadedScripts[name] = true;
        resolve(name);
      };

      script.onerror = () => {
        if (retries > 0) {
          console.log(`Failed to load script ${name}, retrying... (${retries} retries left)`);
          this._loadSingleScript(name, url, retries - 1).then(resolve).catch(reject);
        } else {
          reject(new Error(`Failed to load script ${name} after 3 retries.`));
        }
      };

      document.head.appendChild(script);
    });

    this.loadingScripts[name] = promise;
    return promise;
  },


  ready: function (name, callback) {
    if (!this.loadedScripts[name] && !this.loadingScripts[name]) {
      throw new Error("Script '" + name + "' has not been registered for loading. Please use load() method first.");
    }

    var dependencies = this.scriptOrder.slice(0, this.scriptOrder.indexOf(name) + 1); // Get all dependencies
    var dependenciesLoadPromises = dependencies.map(dep => this.loadingScripts[dep]); // Get promises of all dependencies

    Promise.all(dependenciesLoadPromises).then(() => callback()); // Execute callback when all dependencies are loaded
  }
};