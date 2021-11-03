$(document).ready(function() {
    $('input[type="radio"]').click(function() {
        if($(this).attr('id') == 'doubly' || $(this).attr('id') == 'singly') {
             $('.hide-items').show();
        }
        else {
             $('.hide-items').hide();
        }
    });
});
