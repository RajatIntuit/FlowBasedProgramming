# Table of contents
- [Flow Design Tool for Xfinity Gears](#flow-design-tool-for-xfinity-gears)
  * [POC Evaluation](#poc-evaluation)
- [POC 1 - NodeRed](#poc-1---nodered)
  * [Build and Deploy Steps](#build-and-deploy-steps)
  * [New component creation steps](#new-component-creation-steps)
  * [Snapshots](#snapshots)
  * [Flow JSON](#flow-json)
- [POC 2 - TotalJS](#poc-2---totaljs)
  * [Build and Deploy Steps](#build-and-deploy-steps-1)
  * [New component creation steps](#new-component-creation-steps-1)
  * [Snapshots](#snapshots-1)
  * [Flow JSON](#flow-json-1)
- [POC 3 - NoFlo](#poc-3---noflo)
  * [Build and Deploy Steps](#build-and-deploy-steps-2)
  * [New component creation steps](#new-component-creation-steps-2)
  * [Snapshots](#snapshots-2)
  * [Flow JSON](#flow-json-2)
- [POC 4 - ProjectStorm](#poc-4---projectstorm)
  * [Build and Deploy Steps](#build-and-deploy-steps-3)
  * [New component creation steps](#new-component-creation-steps-3)
  * [Snapshots](#snapshots-3)
  * [Flow JSON](#flow-json-3)
- [POC 5 - GoJS](#poc-5---gojs)
  * [Build and Deploy Steps](#build-and-deploy-steps-4)
  * [New component creation steps](#new-component-creation-steps-4)
  * [Snapshots](#snapshots-4)
  * [Flow JSON](#flow-json-4)

# Flow Design Tool for Xfinity Gears
The [Flow based programming paradigm](https://en.wikipedia.org/wiki/Flow-based_programming) is now available through various open-source frameworks - [NodeRed](https://nodered.org/), [TotalJS](https://www.totaljs.com/flowboard/), [NoFlo](https://noflojs.org/), [ProjectStorm](http://www.projectstorm.io/), [GoJS](https://gojs.net/latest/index.html). This POC is to evaluate the frameworks based on the capabilities/features provided and extend their codebase to implement the [Xfinity Gears Component library](https://s3-us-west-2.amazonaws.com/xasdoc/components.html).
----
## POC Evaluation
----
5 frameworks were scored on a scale of 1-10 for each feature and then ranked on the overall score. NodeRed, TotalJS and NoFlo were found to be equivalent in terms of the key features like support for multiple I/O ports, component specific parameters with embeddable JS functions, export/import flow JSONs and runtime engine integration. NodeRed seems to have an edge in terms of the ease of extending components as well as deployment, though it scored a lower overall score mostly due to an old tech stack. TotalJS was ranked the highest mostly due to support for web, mobile, desktop apps, 3D home designer integration with flows as well as Analytics Dashboard.

|                                 |     |            |     |               |     |                 |    |                    |    |              | 
|---------------------------------|-----|------------|-----|---------------|-----|-----------------|----|--------------------|----|--------------| 
| Features | NodeRed                         |     | TotalJS    |     | NoFlo         |     | ProjectStorm    |    | GoJS               |    |              | 
| Multiple I/O ports              | 8   | port index | 8   | port index    | 9   | port name       | 8  | port index         | 8  | node index   | 
| Component specific params       | 9   |            | 9   | type support  | 9   |                 |    |                    |    |              | 
| Embed JS functions/templates    | 9   |            | 9   |               | 9   |                 |    |                    |    |              | 
| Export/Import Flow json         | 9   |            | 8   |               | 8   |                 | 8  |                    | 8  |              | 
| Ease of component extension     | 9   |            | 9   |               | 7   |                 | 7  |                    |    |              | 
| Event injection to flows        | 9   |            | 9   |               | 9   |                 |    |                    |    |              | 
| Assign InstanceId to component  | 9   |            | 9   |               | 9   |                 | 7  |                    |    |              | 
| Runtime integration with sheens | 7   |            | 7   |               | 9   |                 |    |                    |    |              | 
| Debugging flows                 | 7   |            | 5   |               | 9   | flow animations |    |                    |    |              | 
| Unit/Integration Test           |     |            |     |               | 8   |                 |    |                    |    |              | 
| Authentication & Authorization  |     |            |     |               |     |                 |    |                    |    |              | 
| Flow version management         |     |            |     |               |     |                 |    |                    |    |              | 
| Tech Stack                      | 7   | jQuery/D3  | 9   | Angular2      | 9   | React           | 9  | React              | 5  | HTML5/JS/CSS | 
| Look & Feel                     | 7   |            | 9   | Web+Desktop   | 9   |                 | 7  |                    | 5  |              | 
| Build & Deploy                  | 9   | python     | 7   | node debug.js | 7   | grunt dev       | 5  | yarn run storybook | 9  | python       | 
| 3D Home integration with flows  |     |            | 9   | flowboard     |     |                 |    |                    |    |              | 
| Dashboard & Analytics           |     |            | 9   | flowdashboard |     |                 |    |                    |    |              | 
| License                         | 7   | Apache 2.0 | 7   | MIT           | 7   | MIT             | 7  | MIT                |    | Enterprise   | 
| Total                           | 106 |            | 123 |               | 118 |                 | 58 |                    | 35 |              | 


----
# POC 1 - NodeRed
----
## Build and Deploy Steps
```
python -m SimpleHTTPServer
Open http://localhost:8000
Import poc1_nodered_flow.json to render the flow UI
Sidebar components will get populated based on https://s3-us-west-2.amazonaws.com/xasdoc/components.html
```

## New component creation steps
```
1. index.html - Add NodeDefinitions with I/O ports and component specific params 
    {"type":"CheckCondition","data":{"defaults":{"name":{"value":"new"},"condition":{"value":"new"},"ed":{"value":"yes"},"reset":{"value":"yes"},"debug":{"value":"yes"},"errors":{"value":"no"}},"shortName":"check_condition","inputs":1,"outputs":2,"category":"condition-function","color":"LightGreen","icon":"arrow-in.png"}}
2. index.html - Add Component Summary and tool tip text
    <script type="text/x-red" data-help-name="CheckCondition">
3. index.html - Add Component Parameters form 
    <script type="text/x-red" data-template-name="CheckCondition">
4. editor.js - Params inside "defaults" of NodeDefinitions will be tracked for changes as below
    if (editing_node._def.defaults.hasOwnProperty(d)) {}
5. library.js - Imported flow JSON will be rendered in UI and each component param will be prefixed with '#node-input-'
    function createUI(options) {
		$('#node-input-'+options.type+'-menu-open-library').click(function(e) {
6. palette.js - Define component categories used in NodeDefinitions
    var core = ['trigger','condition','action'];
7. nodes.js - Add new categories shown as group in sidebar
    function checkForIO() 
8. view.js - Function to import flow json
    function importNodes(newNodesStr,touchImport) {
9. main.js - Export flow as JSON
    function save(force) {
		RED.storage.update();

		if (RED.nodes.hasIO()) {
			var nns = RED.nodes.createCompleteNodeSet();
			nns.sort(function(a,b){ return (a.x + a.y/250) - (b.x + b.y/250); });
			RED.view.state(RED.state.EXPORT);
			RED.view.getForm('dialog-form', 'export-clipboard-dialog', function (d, f) {
				$("#node-input-export").val(JSON.stringify(nns, null, 2)).focus(function() {
```

## Snapshots
![POC1 snapshot](https://github.comcast.com/XfinityRulesService/gears-flows/blob/master/samples/poc1_nodered_flow.png)

## Flow JSON
https://github.comcast.com/XfinityRulesService/gears-flows/blob/master/samples/poc1_nodered_flow.json

----
# POC 2 - TotalJS
----
## Build and Deploy Steps
```
npm install -g yarn
yarn
node debug.js
Open http://localhost:8000/flow
Flow definition at flow/designer.json will be loaded by default
```

## New component creation steps
```
https://wiki.totaljs.com/flow/05-creating-components/

1. Use an existing component from flow folder as a template
2. Specify component id, I/O ports, parameters, readme and html for parameters input form
exports.id = 'check_condition';
exports.title = 'CheckCondition';
exports.group = 'Gears-Condition';
exports.color = 'LightGreen';
exports.icon = 'fa-thermometer-half';
exports.input = ['green'];
exports.output = ['blue', 'red'];
exports.version = '1.0.0';
exports.author = 'Xfinity Gears';
exports.options = { condition: 'var x = y + 1', enabled: true, enable_disable: true, reset: true, debug: true, errors: false };
exports.readme = 
`# Condition: CheckCondition
Checks an arbitrary boolean Javascript expression and forwards the in message on the out channel if the expression evaluates to true, otherwise the message will forwarded on the else channel. If no component is connected to the else channel, the message will be dropped.
### Inputs
- First  -> in
### Outputs
- First  -> out
- Second -> else
### Params
name	condition
type	string
doc	condition as evaluable JavaScript string; references to payload and or props are alowed
default	
required	yes
valid values	
`;
exports.html = 
	<div class="row">
		<div class="col-md-4 m">
			<div data-jc="codemirror" data-jc-path="condition" data-jc-config="placeholder:@(var x = y + 1);type:javascript" class="m">Condition</div>
		</div>
	</div>
```

## Snapshots
More Demos at https://www.totaljs.com/flowboard/

![POC2 snapshot](https://github.comcast.com/XfinityRulesService/gears-flows/blob/master/samples/poc2_totaljs_flow.png)
![POC2 snapshot](https://github.comcast.com/XfinityRulesService/gears-flows/blob/master/samples/poc2_totaljs_homedesigner.png)
![POC2 snapshot](https://github.comcast.com/XfinityRulesService/gears-flows/blob/master/samples/poc2_totaljs_analytics.png)

## Flow JSON
https://github.comcast.com/XfinityRulesService/gears-flows/blob/master/samples/poc2_totaljs_flow.json

----
# POC 3 - NoFlo
----
## Build and Deploy Steps
```
npm install -g yarn
yarn
grunt dev
Open http://localhost:3000/examples/demo-full.html
Flow definition at examples/assets/gearsflow.json will be loaded by default
```

## New component creation steps
```
Detailed steps at https://noflojs.org/documentation/components/
```

## Snapshots
![POC3 snapshot](https://github.comcast.com/XfinityRulesService/gears-flows/blob/master/samples/poc3_noflo_flow.png)

## Flow JSON
https://github.comcast.com/XfinityRulesService/gears-flows/blob/master/samples/poc3_noflo_flow.json

----
# POC 4 - ProjectStorm
----
## Build and Deploy Steps
```
npm install -g yarn
yarn
yarn run storybook
Open http://localhost:9001/?selectedKind=3rd%20party%20libraries&selectedStory=Auto%20Distribute%20%28Dagre%29&full=0&addons=1&stories=1&panelRight=1&addonPanel=storybook%2Fcode%2Fpanel
Flow definition will be loaded by default from demos/demo-dagre/index.tsx
```

## New component creation steps
```
Only generic components can be created with multiple I/O ports
Detailed steps at https://www.npmjs.com/package/storm-react-diagrams

  "links": [
    {
      "id": "test-uid-2147",
      "type": "default",
      "selected": false,
      "source": "test-uid-2143",
      "sourcePort": "test-uid-2144",
      "target": "test-uid-2145",
      "targetPort": "test-uid-2146",
      "points": [
        {
          "id": "test-uid-2148",
          "selected": false,
          "x": 139.96665954589844,
          "y": 133.14999389648438
        },
        {
          "id": "test-uid-2149",
          "selected": false,
          "x": 409.5,
          "y": 133.14999389648438
        }
      ],
      "extras": {}
    }
  ],
  "nodes": [
    {
      "id": "test-uid-2143",
      "type": "default",
      "selected": false,
      "x": 100,
      "y": 100,
      "extras": {},
      "ports": [
        {
          "id": "test-uid-2144",
          "type": "default",
          "selected": false,
          "name": "out-1",
          "parentNode": "test-uid-2143",
          "links": [ "test-uid-2147" ],
          "in": false,
          "label": "Out"
        }
      ],
      "name": "Node 1",
      "color": "rgb(0,192,255)"
    },
    {
      "id": "test-uid-2145",
      "type": "default",
      "selected": false,
      "x": 400,
      "y": 100,
      "extras": {},
      "ports": [
        {
          "id": "test-uid-2146",
          "type": "default",
          "selected": false,
          "name": "in-1",
          "parentNode": "test-uid-2145",
          "links": [ "test-uid-2147" ],
          "in": true,
          "label": "IN"
        }
      ],
      "name": "Node 2",
      "color": "rgb(192,255,0)"
    }
]
},
```

## Snapshots
![POC4 snapshot](https://github.comcast.com/XfinityRulesService/gears-flows/blob/master/samples/poc4_projectstorm_flow.png)

## Flow JSON
https://github.comcast.com/XfinityRulesService/gears-flows/blob/master/samples/poc4_projectstorm_flow.json

----
# POC 5 - GoJS
----
## Build and Deploy Steps
```
python -m SimpleHTTPServer
Open http://localhost:8000/samples/processFlow.html
Flow definition will be loaded by default from samples/processFlow.html
```

## New component creation steps
```
Only generic components can be created with multiple I/O ports
  "nodeDataArray": [
{"key":"P1", "category":"Process", "pos":"150 120", "text":"Process"},
{"key":"V1", "category":"Valve", "pos":"270 120", "text":"V1"},
{"key":"V5", "category":"Valve", "pos":"450 260", "text":"VB", "angle":90}
  "linkDataArray": [
{"from":"V1", "to":"P2"},
{"from":"V5", "to":"P2"}
```

## Snapshots
![POC5 snapshot](https://github.comcast.com/XfinityRulesService/gears-flows/blob/master/samples/poc5_gojs_flow.png)

## Flow JSON
https://github.comcast.com/XfinityRulesService/gears-flows/blob/master/samples/poc5_gojs_flow.json

