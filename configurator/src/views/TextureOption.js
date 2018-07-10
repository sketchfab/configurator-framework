import Mustache from 'mustache';

function TextureOption(model, index) {
    this.model = model;
    this.index = index;
}

TextureOption.prototype = {
    template: `
    <label for="{{id}}">{{option.name}}</label>
    <div class="option__control">
        {{#options}}
            <label class="texture" data-url="{{url}}">
                <input type="radio" name="{{id}}" value="{{currentIndex}}" data-option="{{index}}" {{#isSelected}}checked{{/isSelected}}>
                <span class="texture__preview">
                    <img src="{{url}}?preview" width="100" height="100" alt="{{name}}">
                </span>
                <span class="texture__name">{{name}}</span>
            </label>
        {{/options}}
    </div>
    `,

    _generateId: function() {
        return 'control_' + Math.floor(Math.random() * 10000);
    },

    render: function() {
        if (!this.el) {
            this.el = document.createElement('DIV');
            this.el.className = 'option option--texture';

            var currentValue = this.model.getOptionValue(this.index);
            var optionsWithIndex = this.model.options[this.index].options.map((opt, index) => {
                return Object.assign({}, opt, {
                    currentIndex: index,
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
};

export default TextureOption;
