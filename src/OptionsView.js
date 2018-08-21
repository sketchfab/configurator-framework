import ColorOption from './views/ColorOption';
import SelectOption from './views/SelectOption';
import TextureOption from './views/TextureOption';
import VisibleOption from './views/VisibleOption';

const FORM_CLASS_NAME = 'sketchfab-configurator';

/**
 * View for the configurator UI.
 *
 * The OptionsView will create subviews for each option and listen for all `change` events.
 */
class OptionsView {
    constructor(el, model) {
        this.el = el;
        this.model = model;
        this.subviews = [];
        this.isRendered = false;
        this._handleOptionChange = this._handleOptionChange.bind(this);
        this.el.addEventListener('change', this._handleOptionChange, false);
        this.render();
    }

    /**
     * Renders the view
     */
    render() {
        if (this.isRendered) {
            return;
        }

        this.formEl = document.createElement('form');
        this.formEl.className = FORM_CLASS_NAME;
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

        this.isRendered = true;
    }

    /**
     * Disposes the view
     * Removes event listeners and empties the DOM element.
     */
    dispose() {
        this.formEl.removeEventListener('change', this._handleOptionChange, false);
        this.el.innerHTML = '';
        this.subviews = [];
        this.isRendered = false;
    }

    _handleOptionChange(e) {
        e.preventDefault();
        const target = e.target;
        const optionIndex = parseInt(target.getAttribute('data-option'), 10);
        const value = target.type === 'checkbox' ? !!target.checked : target.value;
        this.model.setOptionValue(optionIndex, value);
    }
}

export default OptionsView;
