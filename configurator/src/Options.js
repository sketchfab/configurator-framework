class Options {
    constructor(options, viewer) {
        this.options = options;
        this.viewer = viewer;
        this.values = [];
        this.initialize();
    }

    initialize() {
        for (var i = 0, l = this.options.length; i < l; i++) {
            switch (this.options[i].type) {
                case 'visible':
                    this.setOptionValue(i, !!this.options[i].default);
                    break;
                case 'color':
                    this.setOptionValue(i, this.options[i].default);
                    break;
                case 'select':
                    if (this.options[i].default) {
                        this.setOptionValue(i, this.options[i].default);
                    } else {
                        this.setOptionValue(i, 0);
                    }
                    break;
                case 'texture':
                    this.setOptionValue(i, this.options[i].default);
                    break;
            }
        }
    }

    setOptionValue(optionIndex, value) {
        var option = this.options[optionIndex];
        var fn = {
            color: 'applyOptionColor',
            visible: 'applyOptionVisible',
            select: 'applyOptionSelect',
            texture: 'applyOptionTexture'
        };

        if (option.type === 'select' || option.type === 'texture') {
            value = parseInt(value, 10);
        }

        if (option.type === 'visible') {
            value = Boolean(value);
        }

        this.values[optionIndex] = value;
        this[fn[option.type]].apply(this, [optionIndex, value]);
    }

    getOptionValue(optionIndex) {
        return this.values[optionIndex];
    }

    applyOptionColor(optionIndex, color) {
        var option = this.options[optionIndex];

        if (option.type !== 'color') {
            throw new Error('Option is not of "color" type');
        }

        var material = option.material;
        this.viewer.setColor(material, color);
    }

    applyOptionVisible(optionIndex, isVisible) {
        var option = this.options[optionIndex];

        if (option.type !== 'visible') {
            throw new Error('Option is not of "visible" type');
        }

        var selector = option.selector;
        if (isVisible) {
            this.viewer.show(selector);
        } else {
            this.viewer.hide(selector);
        }
    }

    applyOptionSelect(optionIndex, selectedIndex) {
        var option = this.options[optionIndex];

        if (option.type !== 'select') {
            throw new Error('Option is not of "select" type');
        }

        for (var i = 0, l = option.options.length; i < l; i++) {
            if (option.options[i].selector === '') {
                continue;
            }

            if (i === selectedIndex) {
                this.viewer.show(option.options[i].selector);
            } else {
                this.viewer.hide(option.options[i].selector);
            }
        }
    }

    applyOptionTexture(optionIndex, selectedIndex) {
        var option = this.options[optionIndex];

        if (option.type !== 'texture') {
            throw new Error('Option is not of "texture" type');
        }

        for (var i = 0, l = option.options.length; i < l; i++) {
            if (i === selectedIndex) {
                this.viewer.setTexture(option.material, option.channels, option.options[i].url);
            }
        }
    }
}

export default Options;