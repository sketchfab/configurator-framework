import Mustache from 'mustache';

/**
 * View for 'select' option
 */
class SelectOption {
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
            this.el.className = 'option option--select';

            var currentValue = this.model.getOptionValue(this.index);
            var optionsWithIndex = this.model.options[this.index].options.map((opt, index) => {
                return Object.assign({}, opt, {
                    index: index,
                    isSelected: index === currentValue
                });
            });

            var html = Mustache.render(this.template, {
                id: this._generateId(),
                index: this.index,
                option: this.model.options[this.index],
                options: optionsWithIndex,
                value: currentValue
            });
            this.el.innerHTML = html;
        }
        return this;
    }
}

SelectOption.prototype.template = `
<label for="{{id}}">{{option.name}}</label>
<div class="option__control">
    <select id="{{id}}" data-option="{{index}}" value="{{value}}">
        {{#options}}
            <option value="{{index}}" {{#isSelected}}selected{{/isSelected}}>{{name}}</option>
        {{/options}}
    </select>
</div>
`;

export default SelectOption;
