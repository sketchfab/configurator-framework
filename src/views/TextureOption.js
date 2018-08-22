import Mustache from 'mustache';

/**
 * View for 'texture' option
 */
class TextureOption {
    /**
     * @param {object} model Options instance
     * @param {number} index Index of option
     */
    constructor(model, index) {
        this.model = model;
        this.index = index;
    }

    _generateId() {
        return 'control_' + Math.floor(Math.random() * 10000);
    }

    /**
     * Renders the view
     */
    render() {
        if (!this.el) {
            this.el = document.createElement('DIV');
            this.el.className = 'option option--texture';

            var currentValue = this.model.getOptionValue(this.index);
            var renderOptions = this.model.options[this.index].options.map((opt, index) => {
                return Object.assign({}, opt, {
                    currentIndex: index,
                    isSelected: index === currentValue,
                    previewUrl: opt.previewUrl !== undefined ? opt.previewUrl : opt.url + '?preview'
                });
            });

            var html = Mustache.render(this.template, {
                id: this._generateId(),
                index: this.index,
                option: this.model.options[this.index],
                options: renderOptions,
                value: currentValue
            });
            this.el.innerHTML = html;
        }
        return this;
    }
}

TextureOption.prototype.template = `
<label for="{{id}}">{{option.name}}</label>
<div class="option__control">
    {{#options}}
        <label class="texture" data-url="{{url}}">
            <input type="radio" name="{{id}}" value="{{currentIndex}}" data-option="{{index}}" {{#isSelected}}checked{{/isSelected}}>
            <span class="texture__preview">
                <img src="{{previewUrl}}" width="100" height="100" alt="{{name}}">
            </span>
            <span class="texture__name">{{name}}</span>
        </label>
    {{/options}}
</div>
`;

export default TextureOption;
