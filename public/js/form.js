$(document).ready(function() {
    
    $('input[type="radio"]').click(function() {
        if($(this).attr('id') == 'doubly' || $(this).attr('id') == 'singly') {
            $('#vacc-conditional').addClass('show');
        }
        else {
            $('#vacc-conditional').removeClass('show');
        }
    });

    $('[name="inlineRadioOptions"][value="option1"]').click();
});
