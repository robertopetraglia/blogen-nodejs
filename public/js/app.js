// Get the current year for the copyright
$('#year').text(new Date().getFullYear());

$(function() {
    let parsleyValiationOptions = {
        successClass: "has-success",
        errorClass: "has-danger",
        classHandler: function (el) {
            return el.$element.closest('.form-group');
        },
        errorsContainer: function (el) {
            return el.$element.closest('.form-group');
        },
        errorsWrapper: "<div class='alert alert-danger mt-2'></div>",
        errorTemplate: "<span></span>"
    };

    window.Parsley.on('field:error', function() {
        this.$element.addClass('form-control-danger')
    });

    window.Parsley.on('field:success', function() {
        this.$element.next().remove()
    });
    
    $('form').parsley(parsleyValiationOptions);
    
    $('form').on('form:validate', function(form) {
        return form.isValid()
    });
})