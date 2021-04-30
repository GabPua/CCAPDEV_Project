let p_min, p_hr, c_min, c_hr, t_min, t_hr, c_help, p_help;

$(document).ready(() => {
    p_hr = $('#prep-hr');
    p_min = $('#prep-min');
    p_help = $('#prep-time-help');
    c_hr = $('#cook-hr');
    c_min = $('#cook-min');
    c_help = $('#cook-time-help');
    t_hr = $('#total-hr');
    t_min = $('#total-min')

    addImgField();
    updateTime();
    p_hr.change(() => updateTime('prep'));
    c_hr.change(() => updateTime('cook'));
    p_min.change(() => updateTime('prep'));
    c_min.change(() => updateTime('cook'));

    const title = $('#recipe-title');
    const title_help = $('#recipe-title-help');

    const desc = $('#recipe-desc');
    const desc_help = $('#recipe-desc-help');

    const serving = $('#servings');
    const serving_help = $('#serving-help');

    title.focusout(() => {
        const help_text = isNotEmpty(title.val());
        updateInputFields(help_text === '', title, title_help, null, help_text);
    });

    desc.focusout(() => {
       const help_text = isNotEmpty(desc.val());
       updateInputFields(help_text === '', desc, desc_help, null, help_text);
    });

    serving.change(() => {
        validateNumElem(serving);
        let help_text = isValidNum(serving.val(), 0);

        updateInputFields(help_text === '', serving, serving_help, null, help_text);
    });

    $('button').click((event) => {
        event.preventDefault();
    });

    // verify all input fields
    $('input:submit').click((event) => {
        event.preventDefault();
        const input = $('input:not([type=submit])');
        const textarea = $('textarea');

        input.trigger('focusout');
        input.trigger('change');
        textarea.trigger('focusout');

        let filled = input.filter(function() {
           return $(this).hasClass('is-success');
        });

        let filledText = textarea.filter(function() {
            return $(this).hasClass('is-success');
        });

        if (input.length === filled.length && textarea.length === filledText.length) {
            $('form').submit();
        }
    });
});

function validateNumElem(elem) {
    if (!elem.val() || elem.val() < 0) {
        elem.val(0);
    }
}

function updateTime(str) {
    validateNumElem(p_hr);
    validateNumElem(p_min);
    validateNumElem(c_hr);
    validateNumElem(c_min);

    let hr = parseInt(p_hr.val() ?? 0) + parseInt(c_hr.val() ?? 0);
    let min = parseInt(p_min.val() ?? 0) + parseInt(c_min.val() ?? 0);

    if (min > 60) {
        hr++;
        min -= 60;
    }

    t_hr.html(hr);
    t_min.html(min);

    let help;
    if (str === 'cook') {
        hr = c_hr;
        min = c_min;
        help = c_help;
    } else if (str === 'prep') {
        hr = p_hr;
        min = p_min;
        help = p_help;
    }

    if (str) {
        let help_text = isValidNum(hr.val(), min.val());

        updateInputFields(help_text === '', hr, null, null, '');
        updateInputFields(help_text === '', min, help, null, help_text);
    }
}

function setup(list, item) {
    list.append(item);

    // prevent submission by remove buttons
    item.find('button').click((event) => {
        event.preventDefault();

        if (list.children(':not(script)').length > 1) {
            item.remove();
        }
    });
}

function updateLabel(input) {
    let url = input.val().split('\\').slice(-1)[0];
    let ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
    const label = input.siblings('.file-name');

    if (isValidImageFormat(ext)) {
        updateInputFields(true, input, label, null, url);
    } else {
        updateInputFields(false, input, label, null, (ext)? 'Invalid file format' : 'Cannot be empty')
        input.val('');
    }
}

let ing_ctr = 0;

function addImgField() {
    const img_list = $('#upload-images');
    const newItem = $(
        `<div class='image-item'>
            <div class="file is-info has-name">
                <label class="file-label">
                    <input class="file-input" type="file" name="picture[]">
                    <span class="file-cta">
                        <span class="file-icon">
                            <i class="fas fa-upload"></i>
                        </span>
                        <span class="file-label">Upload image</span>
                    </span>
                    <span class="file-name"></span>
                </label>
            </div>
            <button class='button is-danger is-light'>Remove</button>
        </div>`);

    const input = newItem.find('input[type="file"]');
    input.change(() => updateLabel(input));

    setup(img_list, newItem);
}

function addIngField(q = '', u= '', n= '') {
    const ing_list = $('#edit-ingredients');
    const newItem = $(
        `<li> 
            <div class='field is-horizontal'>
                <input class='input ing-qty' type='number' placeholder='Qty' name='ingredient[${ing_ctr}][qty]' min='1' value='${q}'>

                <input class='input ing-unit' type='text' placeholder='Unit' name='ingredient[${ing_ctr}][unit]' value='${u}'>

                <input class='input ing-name' type='text' placeholder='Ingredient name' name='ingredient[${ing_ctr++}][name]' value='${n}'>     

                <button class='button is-danger is-light'>Remove</button>
            </div>
        </li>`);

    const qty = newItem.find('.ing-qty');
    const unit = newItem.find('.ing-unit');
    const name = newItem.find('.ing-name');

    qty.focusout(() => {
        updateInputFields(isNotEmpty(qty.val()) === '', qty, null, null, '');
    });

    unit.focusout(() => {
        updateInputFields(isNotEmpty(unit.val()) === '', unit, null, null, '');
    });

    name.focusout(() => {
        updateInputFields(isNotEmpty(name.val()) === '', name, null, null, '');
    });

    setup(ing_list, newItem);
}

function addDirField(content= '') {
    const dir_list = $('#edit-directions');
    const newItem = $(
        `<li> 
            <div class='field is-horizontal'>
                <textarea class='textarea' placeholder='Please include the steps here' name='direction[]'>${content}</textarea>
                <button class='button is-danger is-light'>Remove</button>
            </div>
        </li>`);

    const text = newItem.find('textarea');
    text.focusout(() => {
        updateInputFields(isNotEmpty(text.val()) === '', text, null, null, '');
    });

    setup(dir_list, newItem);
}
