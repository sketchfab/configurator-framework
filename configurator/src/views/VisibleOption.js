import Mustache from 'mustache';

/**
 * View for 'visible' option
 */
class VisibleOption {
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
            this.el.className = 'option option--visible';
            var value = this.model.getOptionValue(this.index);
            var html = Mustache.render(this.template, {
                id: this._generateId(),
                index: this.index,
                option: this.model.options[this.index],
                value: value
            });
            this.el.innerHTML = html;
        }
        return this;
    }
}

VisibleOption.prototype.template = `
<label for="{{id}}">{{option.name}}</label>
<div class="option__control">
    <input type="checkbox" data-option="{{index}}" id="{{id}}" {{#value}}checked{{/value}}>
</div>
`;

export default VisibleOption;
