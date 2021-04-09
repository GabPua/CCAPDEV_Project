let img_list, ing_list, dir_list;
let p_min, p_hr, c_min, c_hr, t_min, t_hr;

$(document).ready(function() {
    $('button').on('click', function (event) {
        event.preventDefault();
    });

    $('input[type="file"]').change(function () {
        updateLabel($(this));
    });

    img_list = $('#upload-images');
    ing_list = $('#edit-ingredients');
    dir_list = $('#edit-directions');

    p_hr = $('#prep-hr');
    p_min = $('#prep-min');
    c_hr = $('#cook-hr');
    c_min = $('#cook-min');
    t_hr = $('#total-hr');
    t_min = $('#total-min')

    p_hr.change(() => updateTime());
    c_hr.change(() => updateTime());
    p_min.change(() => updateTime());
    c_min.change(() => updateTime());
});

function updateTime() {
    let hr = parseInt(p_hr.val()) + parseInt(c_hr.val());
    let min = parseInt(p_min.val()) + parseInt(c_min.val());

    if (min > 60) {
        hr++;
        min -= 60;
    }

    t_hr.html(hr);
    t_min.html(min);
}

let img_ctr = 2;
let ing_ctr = 2;
let dir_ctr = 2;

function setup(list, item, name, ctr) {
    list.append(item);

    $('#' + name.replaceAll('"', '') + ' button').on('click', function(event) {
        event.preventDefault();
    });

    return ctr + 1
}

function updateLabel(input) {
    let url = input.val().split('\\').slice(-1)[0];
    let ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

    if (isValidImageFormat(ext)) {
        input.siblings('.file-name').html(url);
    } else {
        input.siblings('.file-name').html('Invalid file format!');
        input.val('');
    }
}

function addImgField() {
    const id = '"img-' + img_ctr + '"';

    const newItem = `<div class='image-item' id=` + id + `>
        <div class="file is-info has-name">
            <label class="file-label">
                <input class="file-input" type="file" name="resume">
                <span class="file-cta">
                    <span class="file-icon">
                        <i class="fas fa-upload"></i>
                    </span>
                    <span class="file-label">Upload image</span>
                </span>
                <span class="file-name"></span>
            </label>
        </div>
        <button class='button is-danger is-light' onClick='removeField(` + id + `)'>Remove</button>
    </div>`;

    img_ctr = setup(img_list, newItem, id, img_ctr);

    const file_input = $('#' + id.replaceAll('"', '') + ' input[type="file"]');

    file_input.change(() => updateLabel(file_input));
}

function addIngField() {
    const id = '"ing-' + ing_ctr + '"';

    const newItem = `<li id=` + id + `> 
            <div class='field is-horizontal'>
                <input class='input ing-qty' type='text' placeholder='Qty'>
                <input class='input ing-name' type='text' placeholder='Ingredient name'>       
                <button class='button is-danger is-light' onclick='removeField(` + id + `)'>Remove</button>
            </div>
        </li>`;

    ing_ctr = setup(ing_list, newItem, id, ing_ctr);
}

function addDirField() {
    const id = '"dir-' + dir_ctr + '"';

    const newItem = `<li id=` + id + `> 
            <div class='field is-horizontal'>
                <textarea class='textarea' placeholder='Please include the steps here'></textarea>
                <button class='button is-danger is-light' onclick='removeField(` + id + `)'>Remove</button>
            </div>
       </li>`;

    dir_ctr = setup(dir_list, newItem, id, dir_ctr);
}

function removeField(name) {
    const field = $('#' + name);

    if (field.siblings().length > 0) {
        field.remove();
    }
}