import ColorOption from './views/ColorOption';
import SelectOption from './views/SelectOption';
import TextureOption from './views/TextureOption';
import VisibleOption from './views/VisibleOption';

const FORM_CLASS_NAME = 'sketchfab-configurator';

class OptionsView {
    constructor(el, model) {
        this.el = el;
        this.model = model;
        this.els = [];
        this.subviews = [];
        this.initialize();
    }

    initialize() {
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.formEl = document.createElement('form');
        this.formEl.className = FORM_CLASS_NAME;
        this.formEl.addEventListener('change', this.handleOptionChange, false);
        this.el.appendChild(this.formEl);

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
            this.formEl.appendChild(subview.el);
        }
    }

    dispose() {
        this.formEl.removeEventListener('change', this.handleOptionChange, false);
        this.el.innerHTML = '';
    }

    _generateId() {
        return 'control_' + Math.floor(Math.random() * 10000);
    }

    handleOptionChange(e) {
        e.preventDefault();
        var target = e.target;
        var optionIndex = parseInt(target.getAttribute('data-option'), 10);
        var value = target.type === 'checkbox' ? !!target.checked : target.value;
        this.model.setOptionValue(optionIndex, value);
    }
}

export default OptionsView;