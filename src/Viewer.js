import { srgbToLinear, hexToRgb } from './lib/Colors';

/**
 * View for the Viewer
 */
class Viewer {
    constructor(iframe, uid, callback, options) {
        this.iframe = iframe;
        this.uid = uid;
        this.callback = callback;
        this.options = options ? options : {};
        this.api = null;
        this.doc = null;
        this.materials = null;
        this.textures = {};
        this.start();
    }

    /**
     * Starts the viewer
     */
    start() {
        const client = new Sketchfab(this.iframe);

        const defaultParams = {
            graph_optimizer: 0
        };
        const userParams = this.options.hasOwnProperty('params') ? this.options.params : {};
        const params = Object.assign({}, defaultParams, userParams, {
            success: this._onSuccess.bind(this),
            error: this._onError.bind(this)
        });
        client.init(this.uid, params);
    }

    /**
     * Disposes the viewer
     */
    dispose() {
        this.materials = null;
        this.doc = null;
        this.api = null;
        this.callback = null;
        this.uid = null;
        this.iframe.src = 'about:blank';
        this.iframe.className = this.iframe.className
            .replace('js-ready', '')
            .replace('js-started', '');
        this.iframe = null;
    }

    /**
     * Returns the api
     * @return {Object} api
     */
    getApi() {
        return this.api;
    }

    _onSuccess(api) {
        this.api = api;
        api.start(() => {
            this.iframe.className += ' js-started';
        });
        api.addEventListener(
            'viewerready',
            function() {
                this._onViewerReady()
                    .then(
                        function() {
                            console.log('Viewer ready');
                            this.iframe.className += ' js-ready';
                            this.callback();
                        }.bind(this)
                    )
                    .catch(function(error) {
                        console.error(error);
                    });
            }.bind(this)
        );
    }

    _onError() {
        console.error('Viewer error');
    }

    _onViewerReady() {
        const promises = [this._getGraph(), this._getMaterials()];
        return Promise.all(promises)
            .then(
                function(results) {
                    this.doc = results[0];
                    this.materials = results[1];
                    console.info('Graph', results[0]);
                    console.info('Materials', results[1]);
                }.bind(this)
            )
            .catch(function(error) {
                console.error(error);
            });
    }

    _getGraph() {
        if (!this.api) {
            Promise.reject('getGraph: API not ready');
        }

        return new Promise(
            function(resolve, reject) {
                this.api.getSceneGraph(
                    function(err, result) {
                        if (err) {
                            return reject(err);
                        }
                        const doc = document.implementation.createDocument('', '', null);
                        doc.appendChild(this._renderGraphNode(doc, result));
                        resolve(doc);
                    }.bind(this)
                );
            }.bind(this)
        );
    }

    _getMaterials() {
        if (!this.api) {
            Promise.reject('getMaterials: API not ready');
        }

        return new Promise(
            function(resolve, reject) {
                this.api.getMaterialList(function(err, materials) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(materials);
                });
            }.bind(this)
        );
    }

    _getMaterialByName(materialName) {
        if (!this.materials) {
            return null;
        }

        return this.materials.reduce(function(acc, cur) {
            if (cur.name === materialName) {
                return cur;
            }
            return acc;
        }, null);
    }

    _renderGraphNode(doc, node) {
        var newNode = doc.createElement(node.type);
        newNode.setAttribute('instance', node.instanceID);
        if (node.name) {
            newNode.setAttribute('name', node.name);
        }

        if (node.children && node.children.length) {
            for (var i = 0, l = node.children.length; i < l; i++) {
                newNode.appendChild(this._renderGraphNode(doc, node.children[i]));
            }
        }
        return newNode;
    }

    _getInstanceIDsFromSelector(selector) {
        const nodes = Array.from(this.doc.querySelectorAll(selector));
        const ids = nodes.map(function(node) {
            return node.getAttribute('instance');
        });
        return ids;
    }

    /**
     * Shows objects targeted by selector
     * @param {String} selector CSS Selector for object to show
     */
    show(selector) {
        if (!this.api) {
            console.error('show: viewer not ready');
            return;
        }
        const ids = this._getInstanceIDsFromSelector(selector);
        ids.forEach(
            function(instanceId) {
                this.api.show(instanceId);
            }.bind(this)
        );
    }

    /**
     * Hides objects targeted by selector
     * @param {string} selector CSS Selector for object to hide
     */
    hide(selector) {
        if (!this.api) {
            console.error('hide: viewer not ready');
            return;
        }
        const ids = this._getInstanceIDsFromSelector(selector);
        ids.forEach(
            function(instanceId) {
                this.api.hide(instanceId);
            }.bind(this)
        );
    }

    /**
     * Sets color (Diffuse, DiffusePBR, AlbedoPBr) for given material name
     * @param {string|string[]} material Name of material. Also accepts array of names for changing multiple materials at once.
     * @param {string} hexColor Hex color
     */
    setColor(material, hexColor) {
        if (!this.api) {
            console.error('setColor: viewer not ready');
            return;
        }

        if (!Array.isArray(material)) {
            material = [material];
        }

        material.forEach(mat => {
            this._setMaterialColor(mat, hexColor);
        });
    }

    _setMaterialColor(materialName, hexColor) {
        let material = this._getMaterialByName(materialName);
        const linearColor = srgbToLinear(hexToRgb(hexColor));
        material.channels.AlbedoPBR.color = linearColor;
        material.channels.DiffusePBR.color = linearColor;
        material.channels.DiffuseColor.color = linearColor;
        material.channels.AlbedoPBR.texture = undefined;
        material.channels.DiffusePBR.texture = undefined;
        material.channels.DiffuseColor.texture = undefined;

        this.api.setMaterial(material, function(err, result) {
            if (err) {
                console.error(err);
            }
        });
    }

    /**
     * Sets texture on material/channels
     * @param {string|string[]} material Name of material. Also accepts array of material names.
     * @param {string|string[]} channels Name of channel. Also accepts array of channel names.
     * @param {string} url URL of the texture.
     */
    setTexture(material, channels, url) {
        if (!Array.isArray(material)) {
            material = [material];
        }

        material.forEach(mat => {
            this._setMaterialTexture(mat, channels, url);
        });
    }

    _setMaterialTexture(materialName, channels, url) {
        let material = this._getMaterialByName(materialName);
        const texturePromise = this._addTexture(url);
        texturePromise.then(textureUid => {
            // Accept array of channel names, or a single channel name
            if (!Array.isArray(channels)) {
                channels = [channels];
            }
            for (var i = 0; i < channels.length; i++) {
                if (
                    material.channels.hasOwnProperty(channels[i]) &&
                    material.channels[channels[i]].texture
                ) {
                    // Update texture UID
                    material.channels[channels[i]].texture.uid = textureUid;
                } else {
                    // Create new texture
                    material.channels[channels[i]].texture = {
                        internalFormat: 'RGB',
                        magFilter: 'LINEAR',
                        minFilter: 'LINEAR_MIPMAP_LINEAR',
                        texCoordUnit: 0,
                        textureTarget: 'TEXTURE_2D',
                        uid: textureUid,
                        wrapS: 'REPEAT',
                        wrapT: 'REPEAT'
                    };
                }
            }
            this.api.setMaterial(material, function(err, result) {
                if (err) {
                    console.error(err);
                }
            });
        });
    }

    _addTexture(url) {
        return new Promise((resolve, reject) => {
            if (this.textures.hasOwnProperty(url)) {
                resolve(this.textures[url]);
            } else {
                this.api.addTexture(url, (err, textureUid) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.textures[url] = textureUid;
                        resolve(textureUid);
                    }
                });
            }
        });
    }
}

export default Viewer;
