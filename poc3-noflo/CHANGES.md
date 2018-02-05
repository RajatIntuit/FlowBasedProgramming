## dev

## 0.10.2 (2017 August 23)

Bugfixes

* Fixed unable to create edge from node context menu

## 0.10.1 (2017 August 17)

Bugfixes

* Fixed compatibility with browsers only supporting `TouchEvent`, including Safari on iOS.
* Fixed exception on long-press if no menu was defined

UI changes

* Movement threshold for starting panning reduced, making it a bit easier

## 0.10.0 (2017 June 28)

UI changes

* Edges cannot be dropped on target port. Have to tap to complete edge connection.
* Menu item cannot be opened by swiping and releasing. Have to tap to perform menu action.

Breaking changes

* Polymer element `the-graph-thumb` has been removed.
Should instead use the JavaScript API `TheGraph.thumb.render()`,
as shown in `examples/demo-thumbnail.html`.
* Polymer element `the-graph-nav` has been removed.
Should instead use the new React component `TheGraph.nav.Component`,
as shown in `examples/demo-full.html`
* Polymer element `the-graph` has been removed.
Use React component `TheGraph.Graph` instead.
* Polymer element `the-graph-editor` has been removed.
Use React component `TheGraph.App` instead, as shown in `examples/demo-simple.html`

Deprecated APIs, to be removed

* `TheGraph.editor.getDefaultMenus()`, should be explicitly set by app.
* `TheGraph.autolayout.applyAutolayout()`, should be included in app if wanted.
* `TheGraph.App::updateIcon()`, should instead pass `nodeIcons` prop.
* `TheGraph.App::getComponent()`, should instead use info from the passed in `library` prop.
* Property `getMenuDef` of `TheGraph.App` is deprecated, should pass the data in `menus` prop instead.
* All methods on React elements are planned to be deprecated in favor of passing props.

Added APIs

* `TheGraph.library.libraryFromGraph()`, returns component library from a `fbp-graph.Graph` instance
in format compatible with the `library` prop.

Bugfixes

* Changing `graph` prop of React element should now correctly reset and follow new graph instance.

Internal changes

* Usage of PolymerGestures has been replaced by hammer.js
* No longer depends on Polymer or webcomponents
* All dependencies are installed via NPM, bower is no longer used
* Some more modules have been converted to proper CommonJS

## 0.9.0 (2017 May 6)

New features

* `the-graph-editor` Polymer element and `Graph` React component now support a `readonly` property.
When set to true, destructive actions

Internal changes

* `menuCallback`: An empty object is considered falsy and will not show a menu.

## 0.8.0 (2017 May 6)

Additions

* `fbp-graph` dependency is now exposed as `fbpGraph` on the top-level module.
Ex: `TheGraph.fbpGraph` when including `dist/the-graph.js`.

Breaking changes

* Polymer element `the-graph-nav` no longer takes and directly manipulates `editor`.
Instead it fires events like `panto`. And it expects `graph` and `view` attributes to be set.
Tapping the element does not manipulate anything, only fires the `tap` event.
See `examples/demo-full.html` for usage.
* Polymer element `the-graph-editor` no longer accepts a JSON string as input for `graph` property.
Instead the property must always be a `fbpGraph.Graph` instance.
The event `graphInitialised`, which was used for this old async behavior has also been removed.

## 0.7.0 (2017 March 2)

Breaking changes

* Polymer elements no longer automatically include the neccesary JS files.
Instead users must include `dist/the-graph.js`, which bundles the needed JavaScript and provides API under `window.TheGraph`.
The file is included in `the-graph` NPM packages.
This is preparation for removing the Polymer dependency, instead providing JS APIs and React components.

## 0.6.0 (2017 January 5)

* Add all dependencies besides Polymer to NPM.
In the fututure NPM will be the recommended way to install, and Bower is considered deprecated.

## 0.5.0 (2017 January 5)

* Depend on [fbp-graph](https://github.com/flowbased/fbp-graph) instead of NoFlo.
Build size significantly reduced.
* Examples were cleaned up and can now be found under examples/

## 0.4.4 (2016 July 27)

* Arrows on edges (#277) thanks @ifitzpatrick
* Font Awesome 4.6.3

## 0.4.2 (2016 June 24)

* Fix pinch on touch screens (#286)

## 0.4.1 (2016 May 23)

* Hotkeys: <kbd>delete</kbd>, <kbd>f</kbd> for fit, <kbd>s</kbd> to zoom selection (#272) thanks @ifitzpatrick

## 0.4.0 (2015 December 5)

* React 0.14.3 (#231) thanks @u39kun

## 0.3.12 (2015 September 30)

* Build dependencies
* JSHint with inline scripts; remove grunt-lint-inline
* Polymer 0.5.6
* Fix tooltip bug (#226)
* Fix pinch-to-zoom crash (introduced with #218)

## 0.3.11 (2015 August 6)

* Fire graphInitialised event (#204)
* Allow max/min zoom parameterised (#218)
* Ports of type 'any' highlight for incoming edges (#220)
* Better thumbnail drawing (#221)
* (previous 4 thanks @townxelliot)
* Icon/library fix (#223)
* Font Awesome 4.4.0
* React 0.13.3

## 0.3.10 (2015 January 23)

* Font Awesome 4.3.0
* React 0.12.2
* ~~Polymer 0.5.3~~ (doesn't work in Safari 7-8)

## 0.3.9 (2015 January 20)

* Define offset of graph editor (#190) thanks @fabiancook
* Improve heartbeats for animated edges (#194) thanks @lhausermann
* Fire "nodes" event when selected nodes change
* Fire "edges" event when selected edges change
* Remove selection on delete (#195)

## 0.3.8 (2014 December 19)

* Update to Polymer 0.5.2

## 0.3.7 (2014 December 11)

* `React.createFactory` and `displayName` for all React elements
* Can't access element `key` in React >=0.12.0 ([reduced case](http://jsbin.com/wuseho/1/edit?js,output))

## 0.3.6 (2014 December 11)

* Update to [React 0.12.1](https://github.com/facebook/react/releases/tag/v0.12.1)
* Move to [klayjs-noflo](https://github.com/noflo/klayjs-noflo)
* Fix Windows build (#192)

## 0.3.5 (Durham, 2014 November 14)

* Update to [Polymer 0.5.1](https://github.com/Polymer/polymer/releases/tag/0.5.1)

## 0.3.4 (London, 2014 October 23)

* Enable SVG icon to be loaded (#178) thanks @lhausermann
* font-awesome to 4.2.0

## 0.3.3 (2014 September 18)

* Copy and paste (#167) thanks @mpricope

## 0.3.2 (2014 September 11)

* Deployed with noflo-ui 0.2.0
* map-style zooming to node (#165) thanks @djdeath

## 0.3.1 (2014 September 4)

* PolymerGestures fixed with Polymer 0.4.0

## 0.3.0 (2014 August 21)

* Factories for component customization (#157) thanks @hayesmg
* Node height expands when there are many ports (#158)

## 0.2.6 (Helsinki, 2014 August 4)

* lib updates
* including noflo via npm; build with `grunt browserify`

## 0.2.5 (Helsinki, 2014 June 3)

* `grunt build` now builds the Font Awesome unicode map, so we can use aliases #149

## 0.2.3 (Frisco, 2014 May 25)

* [loopback-tweak](https://cloud.githubusercontent.com/assets/395307/3077862/ee7f0c1a-e447-11e3-920d-6aebe75cfd76.gif)

## 0.2.0 (Frisco, 2014 May 17)

* Working with Polymer 0.2.3 and native custom elements.

## 0.1.0 (2014 April 2)

* First all-SVG version

## 0.0.2 (2014 February 24)

* Goodbye slow DOM

## 0.0.1 (2013 Nov 28)

* All custom elements
