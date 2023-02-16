(function ($) {
    function getCookie(c_name) {
        if (document.cookie.length > 0) {
            let c_start = document.cookie.indexOf(c_name + "=");
            if (c_start !== -1) {
                c_start = c_start + c_name.length + 1;
                let c_end = document.cookie.indexOf(";", c_start);
                if (c_end === -1) c_end = document.cookie.length;
                return unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    }

    function openModal(html) {
        const $html = $(html).appendTo('body');

        $html.modal();

        const $form = $html.find('form');
        $html.on('submit', 'form', async (e) => {
            e.preventDefault();

            const url = $form.attr('action');
            const response = await fetch(url, {
                method: 'POST',
                headers: {"X-CSRFToken": getCookie("csrftoken")},
                body: new FormData($form.get(0)),
            });

            if (!response.ok) {
                const text = await response.text();
                return openModal(text);
            }

            if (response.redirected) {
                const text = await response.text();
                const newDoc = document.open("text/html", "replace");
                newDoc.write(text);
                newDoc.close();
            }
        });
    }

    $('[rel="refund-modal:open"]').on('click', async (event) => {
        event.preventDefault();

        const $el = $(event.target);
        const html = await $.get($el.attr('href'));
        openModal(html)
    });
// eslint-disable-next-line no-undef
})(django.jQuery);
