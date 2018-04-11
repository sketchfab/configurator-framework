import { srgbToLinear, hexToRgb } from './lib/Colors';

export default function Viewer(iframe, uid, callback, options) {
    this.iframe = iframe;
    this.uid = uid;
    this.callback = callback;
    this.options = options ? options : {};

    this.api = null;
    this.doc = null;
    this.materials = null;
    this.start();
}

Viewer.prototype = {
    start: function start() {
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
    },

    dispose: function() {
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
    },

    getApi: function() {
        return this.api;
    },

    _onSuccess: function _onSuccess(api) {
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
    },

    _onError: function _onError() {
        console.error('Viewer error');
    },

    _onViewerReady: function _onViewerReady() {
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
    },

    _getGraph: function _getGraph() {
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
    },

    _getMaterials: function _getMaterials() {
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
    },

    _renderGraphNode: function _renderGraphNode(doc, node) {
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
    },

    _getInstanceIDsFromSelector: function(selector) {
        var nodes = Array.from(this.doc.querySelectorAll(selector));
        var ids = nodes.map(function(node) {
            return node.getAttribute('instance');
        });
        return ids;
    },

    show: function show(selector) {
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
    },

    hide: function hide(selector) {
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
    },

    setColor: function(material, hexColor) {
        if (!this.api) {
            console.error('setColor: viewer not ready');
            return;
        }

        if (!Array.isArray(material)) {
            material = [material];
        }

        material.forEach(
            function(mat) {
                this._setMaterialColor(mat, hexColor);
            }.bind(this)
        );
    },

    _setMaterialColor: function(material, hexColor) {
        var material = this.materials.reduce(function(acc, cur) {
            if (cur.name === material) {
                return cur;
            }
            return acc;
        }, null);

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
    },

    setTexture: function setTexture(materialName, channels, url) {
        console.log(arguments);
        var material = this.materials.reduce(function(acc, cur) {
            if (cur.name === materialName) {
                return cur;
            }
            return acc;
        }, null);

        this.api.addTexture(
            url,
            function(err, textureUid) {
                for (var i = 0; i < channels.length; i++) {
                    if (
                        material.channels.hasOwnProperty(channels[i]) &&
                        material.channels[channels[i]].texture
                    ) {
                        material.channels[channels[i]].texture.uid = textureUid;
                    }
                }
                this.api.setMaterial(material, function(err, result) {
                    if (err) {
                        console.error(err);
                    }
                });
            }.bind(this)
        );
    }
};
