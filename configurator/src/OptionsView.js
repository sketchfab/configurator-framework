import ColorOption from './views/ColorOption';
import SelectOption from './views/SelectOption';
import TextureOption from './views/TextureOption';
import VisibleOption from './views/VisibleOption';

export default function OptionsView(el, model) {
    this.el = el;
    this.model = model;
    this.els = [];
    this.subviews = [];
    this.initialize();
}

OptionsView.prototype = {
    initialize: function() {
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.el.addEventListener('change', this.handleOptionChange, false);

        const classes = {
            color: ColorOption,
            visible: VisibleOption,
            select: SelectOption,
            texture: TextureOption
        };

        var subview;
        for (var i = 0, l = this.model.options.length; i < l; i++) {
            subview = new classes[this.model.options[i].type](this.model, i);
            subview.render();
            this.subviews.push(subview);
            this.el.appendChild(subview.el);
        }
    },

    dispose: function() {
        this.el.removeEventListener('change', this.handleOptionChange, false);
        this.el.innerHTML = '';
    },

    _generateId: function() {
        return 'control_' + Math.floor(Math.random() * 10000);
    },

    handleOptionChange: function(e) {
        e.preventDefault();
        var target = e.target;
        var optionIndex = parseInt(target.getAttribute('data-option'), 10);
        var value = target.type === 'checkbox' ? !!target.checked : target.value;
        this.model.setOptionValue(optionIndex, value);
    }
};
