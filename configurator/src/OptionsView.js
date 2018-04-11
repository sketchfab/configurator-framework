export default function OptionsView(el, model) {
    this.el = el;
    this.model = model;
    this.els = [];
    this.initialize();
}

OptionsView.prototype = {
    initialize: function() {
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.el.addEventListener('change', this.handleOptionChange, false);

        var fns = {
            color: 'colorOption',
            visible: 'visibleOption',
            select: 'selectOption',
            texture: 'textureOption'
        };
        for (var i = 0, l = this.model.options.length; i < l; i++) {
            this[fns[this.model.options[i].type]].call(this, i);
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
    },

    colorOption: function(index) {
        var option = this.model.options[index];
        var id = this._generateId();
        var el = document.createElement('DIV');
        el.className = 'option option--color';
        el.innerHTML = `
            <label for="${id}">${option.name}</label>
            <div class="option__control">
            </div>
        `;

        var container = el.querySelector('.option__control');
        var defaultValue = this.model.getOptionValue(index);
        if (option.hasOwnProperty('options')) {
            var colorElements = option.options.map(function(opt, i) {
                var checked = opt.color === defaultValue ? 'checked="checked"' : '';
                return `
                    <label class="color">
                        <input type="radio" name="${id}" value="${opt.color}" data-option="${index}" ${checked}>
                        <span class="color__swatch" style="background-color: ${
                            opt.color
                        }"></span>
                        <span class="color__name">${opt.name}</span>
                    </label>
                `;
            });
            container.innerHTML = colorElements.join('');
        } else {
            container.innerHTML = `<input type="color" data-option="${index}" id="${id}">`;
            var inputEl = el.querySelector('input');
            inputEl.value = this.model.getOptionValue(index);
        }

        this.el.appendChild(el);
    },

    visibleOption: function(index) {
        var option = this.model.options[index];
        var id = this._generateId();
        var el = document.createElement('DIV');
        el.className = 'option option--visible';
        el.innerHTML = `
            <label for="${id}">${option.name}</label>
            <div class="option__control">
                <input type="checkbox" data-option="${index}" id="${id}">
            </div>
        `;
        var checkboxEl = el.querySelector('input');
        if (this.model.getOptionValue(index)) {
            checkboxEl.setAttribute('checked', 'checked');
        }

        // el.addEventListener('change', this.handleOptionChange.bind(this), false);
        this.el.appendChild(el);
    },

    selectOption: function(index) {
        var option = this.model.options[index];
        var id = this._generateId();
        var el = document.createElement('DIV');
        el.className = 'option option--select';
        el.innerHTML = `
            <label for="${id}">${option.name}</label>
            <div class="option__control">
                <select id="${id}" data-option="${index}"></select>
            </div>
        `;

        var selectEl = el.querySelector('SELECT');
        option.options.forEach(function(option, i) {
            var optionEl = document.createElement('OPTION');
            optionEl.innerText = option.name;
            optionEl.value = i;
            selectEl.appendChild(optionEl);
        });
        selectEl.value = this.model.getOptionValue(index);

        // el.addEventListener('change', this.handleOptionChange.bind(this), false);
        this.el.appendChild(el);
    },

    textureOption: function(index) {
        var option = this.model.options[index];
        var id = this._generateId();
        var el = document.createElement('DIV');
        el.className = 'option option--texture';
        el.innerHTML = `
            <label for="${id}">${option.name}</label>
            <div class="option__control">
            </div>
        `;

        var defaultValue = this.model.getOptionValue(index);
        var container = el.querySelector('.option__control');
        var images = option.options.map(function(option, i) {
            var checked = i === defaultValue ? 'checked="checked"' : '';
            return `
                <label>
                    <input type="radio" name="${id}" value="${i}" data-option="${index}" ${checked}>
                    <img src="${option.url}" width="100" height="100" alt="${option.name}">
                    <span>${option.name}</span>
                </label>
            `;
        });
        container.innerHTML = images.join('');

        // el.addEventListener('change', this.handleOptionChange.bind(this), false);
        this.el.appendChild(el);
    }
};
