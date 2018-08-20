import { srgbToLinear, hexToRgb } from './lib/Colors';

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

    start() {
        var client = new Sketchfab(this.iframe);

        var defaultParams = {
            graph_optimizer: 0
        };
        var userParams = this.options.hasOwnProperty('params') ? this.options.params : {};
        var params = Object.assign({}, defaultParams, userParams, {
            success: this._onSuccess.bind(this),
            error: this._onError.bind(this)
        });
        client.init(this.uid, params);
    }

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
                api.addEventListener('click', function(e) {
                    console.info(e);
                });
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
        var promises = [this._getGraph(), this._getMaterials()];
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
                        var doc = document.implementation.createDocument('', '', null);
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
        var nodes = Array.from(this.doc.querySelectorAll(selector));
        var ids = nodes.map(function(node) {
            return node.getAttribute('instance');
        });
        return ids;
    }

    show(selector) {
        if (!this.api) {
            console.error('show: viewer not ready');
            return;
        }
        var ids = this._getInstanceIDsFromSelector(selector);
        ids.forEach(
            function(instanceId) {
                this.api.show(instanceId);
            }.bind(this)
        );
    }

    hide(selector) {
        if (!this.api) {
            console.error('hide: viewer not ready');
            return;
        }
        var ids = this._getInstanceIDsFromSelector(selector);
        ids.forEach(
            function(instanceId) {
                this.api.hide(instanceId);
            }.bind(this)
        );
    }

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
        var material = this._getMaterialByName(materialName);
        var linearColor = srgbToLinear(hexToRgb(hexColor));
        material.channels.AlbedoPBR.color = linearColor;
        material.channels.DiffusePBR.color = linearColor;
        material.channels.DiffuseColor.color = linearColor;
        material.channels.AlbedoPBR.texture = null;
        material.channels.DiffusePBR.texture = null;
        material.channels.DiffuseColor.texture = null;

        this.api.setMaterial(material, function(err, result) {
            if (err) {
                console.error(err);
            }
        });
    }

    setTexture(material, channels, url) {
        if (!Array.isArray(material)) {
            material = [material];
        }

        material.forEach(mat => {
            this._setMaterialTexture(mat, channels, url);
        });
    }

    _setMaterialTexture(materialName, channels, url) {
        var material = this._getMaterialByName(materialName);
        var texturePromise = this._addTexture(url);
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
