import 'babel-polyfill';
import fetch from 'unfetch';
import parseQueryString from './lib/parseQueryString';
import Viewer from './Viewer';
import Options from './Options';
import OptionsView from './OptionsView';

class Configurator {
    constructor(iframeEl, optionsEl, config = null) {
        this.iframeEl = iframeEl;
        this.optionsEl = optionsEl;
        this.optionView = null;
        this.viewer = null;
        this.config = config;

        var promiseConfig;

        if (this.config) {
            promiseConfig = Promise.resolve(this.config);
        } else {
            var parameters = parseQueryString(window.location.search);
            if (parameters.hasOwnProperty('config')) {
                console.log('Loading config from URL', parameters.config);
                promiseConfig = this.loadConfig(parameters.config);
            } else if (window.defaultConfigUrl) {
                console.log('Loading default config URL', window.defaultConfigUrl);
                promiseConfig = this.loadConfig(window.defaultConfigUrl);
            } else if (window.defaultConfig) {
                console.log('Loading config', window.defaultConfig);
                promiseConfig = Promise.resolve(window.defaultConfig);
            } else {
                promiseConfig = Promise.reject('No configuration found');
            }
        }

        promiseConfig
            .then(config => {
                this.config = config;
                this.initialize();
            })
            .catch(error => {
                console.error(error);
            });
    }

    initialize() {
        const config = this.config;
        this.viewer = new SketchfabConfigurator.Viewer(
            iframeEl,
            config.model,
            () => {
                this.optionView = new SketchfabConfigurator.OptionsView(
                    optionsEl,
                    new SketchfabConfigurator.Options(config.config, this.viewer)
                );
            },
            {
                params: config.params ? config.params : {}
            }
        );
    }

    dispose() {
        this.optionView.dispose();
        this.viewer.dispose();
    }

    loadConfig(url) {
        return fetch(url, {
            method: 'GET',
            mode: 'cors'
        }).then(function(response) {
            return response.json();
        });
    }
}

export { Configurator, Viewer, Options, OptionsView };
