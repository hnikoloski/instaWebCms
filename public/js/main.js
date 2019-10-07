$(function () {
    if ($('textarea#ta').length) {
        CKEDITOR.replace('ta');
    }

    $('a.confirmDeletion').on('click', function () {
        if (!confirm('Are you sure you want to delete it?')) return false;
    });
    if ($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox();
    }
});