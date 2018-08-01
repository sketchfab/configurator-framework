# Configurator

This demo shows how to make configurator simply by describing the available options.

## Supported option types

### Color

The `visible` option allows the user to change the color of a material.
The selected color is applied to Diffuse, Diffuse (PBR) and Albedo (PBR) channels.

```json
{
    "name": "Plastic color",
    "type": "color",
    "material": "white_plastic",
    "default": "#1CAAD9"
},
```

You can also include a list of predefined colors:

```json
{
    "name": "Seat color",
    "type": "color",
    "material": ["leather_1", "leather_2"],
    "options": [
        {
            "color": "#333333",
            "name": "Black"
        },
        {
            "color": "#FFFFFF",
            "name": "White"
        },
        {
            "color": "#803A00",
            "name": "Brown"
        }
    ],
    "default": "#803A00"
}
```

### Visible

The `visible` option allows the user to show and hide an object.

```json
{
    "name": "Arms",
    "type": "visible",
    "selector": "[name=\"g_arm\"]",
    "default": false
},
```

### Select

The `select` option allows the user to select an object among a list of objects.
Only the selected object will be visible.

```javascript
{
    "name": "Antenna side",
    "type": "select",
    "options": [
        {
            "selector": "",
            "name": "No antenna"
        },
        {
            "selector": "[name=\"g_head_LEFT\"] [name=\"g_aerial\"]",
            "name": "Left"
        },
        {
            "selector": "[name=\"g_head_RIGHT\"] [name=\"g_aerial\"]",
            "name": "Right"
        }
    ],
    "default": 0
}
```

### Texture

The `texture` option allows the user to change the texture of selected channels of a material.
Images must be CORS-enabled.

```javascript
{
    "name": "Face",
    "type": "texture",
    "material": "face",
    "channels": ["AlbedoPBR", "EmitColor"],
    "options": [
        {
            "name": "Default",
            "url": "https://example.com/face-default.png"
        },
        {
            "name": "Happy",
            "url": "https://example.com/face-happy.jpg"
        },
        {
            "name": "Sleepy",
            "url": "https://example.com/face-sleepy.jpg"
        }
    ],
    "default": 0
}
```

## API

### SketchfabConfigurator.Configurator(iframeEl, optionsEl)

Instanciate a new configurator with 2 DOM elements: an iframe for the viewer and an element that will contain the options.

```javascript
var iframeEl = document.getElementById('api-frame');
var optionsEl = document.querySelector('.options');
var configurator = new SketchfabConfigurator.Configurator(iframeEl, optionsEl, [config]);
```

If `config` object is missing, the configurator will try to load the config from:

* `?config=[url]`
* `window.defaultConfigUrl`
* `window.defaultConfig`

### SketchfabConfigurator.Configurator.prototype.dispose()

Dispose the configurator:

* empty the iframe
* empty the options element
* removes event listeners

### SketchfabConfigurator.Viewer(iframeEl, modelUid, onReadyCallback, config)

Instanciate a new Sketchfab viewer with the following parameters:

* `iframeEl`: iframe DOM elements
* `modelUid`: model uid
* `onReadyCallback`: function that will be called when viewer is ready
* `config`: config

### SketchfabConfigurator.Viewer.prototype.dispose()

### SketchfabConfigurator.OptionsView(optionsEl, optionsObject)

Instanciate an options view with the following parameters:

* `optionsEl`: DOM element where options will be rendered
* `optionsObject`: object of type `SketchfabConfiguration.Options`

### SketchfabConfigurator.Options(config, viewer)

Instanciate an option "model" with the following parameters:

* `config`: config object
* `viewer`: `SketchfabConfigurator.Viewer` instance

## Development

* `npm install` to install dependencies
* `npm run watch` to build/watch for dev

## Building for production / Release

* `npm install` to install dependencies
* `npm version x.x.x` where `x.x.x` is the new semver version
* commit and push to github

## Todo

* [ ] Use material values as default values
* [ ] Support textures or full materials
* [ ] Support scale/translation/rotation
* [ ] Custom color picker
* [ ] UI Customization
* [ ] Add presets for changing multiple properties at once
* [ ] Interactivity? (trigger animation, move camera)
