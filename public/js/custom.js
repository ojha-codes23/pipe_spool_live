// PASSWORD-TOGGLE

$(function () {

    $('.eye').click(function () {
        if ($(this).hasClass('eye-close')) {
            $(this).removeClass('eye-close');
            $(this).addClass('eye-open');
            $(this).parent().parent().find('.password').attr('type', 'text');
        } else {
            $(this).removeClass('eye-open');
            $(this).addClass('eye-close');
            $(this).parent().parent().find('.password').attr('type', 'password');
        }
    });
});

// PASSWORD-TOGGLE


// ENTITY-DROPDOWN

document.addEventListener('click', e => {
    const item = e.target.closest('.entity-dropdown .dropdown-item');
    if (!item) return;

    const dropdown = item.closest('.entity-dropdown');
    const button = dropdown.querySelector('.entity-dropdown-btn');

    dropdown.querySelectorAll('.dropdown-item')
        .forEach(i => i.classList.remove('active'));

    item.classList.add('active');
    button.textContent = item.textContent.trim();
});

// ENTITY-DROPDOWN


