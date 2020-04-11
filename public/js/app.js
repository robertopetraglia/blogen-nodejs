// Get the current year for the copyright
$('#year').text(new Date().getFullYear());

$(function() {
    var parsleyValiationOptions = {
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
        if ($('form#search-post-form').length) {
            $('#btn-search-post').next().remove()
        } else {
            this.$element.next().remove()
        }
    });

    if ($('form#search-post-form').length) {
        parsleyValiationOptions = {
            errorsContainer: function (el) {
                return el.$element.parent().next();
            },
            errorsWrapper: "<div class='btn alert-danger ml-2'></div>",
            errorTemplate: "<span></span>"
        }
    }
        
    $('form').parsley(parsleyValiationOptions);
    
    $('form').on('form:validate', function(form) {
        return form.isValid()
    });

    var querystringJSON = QueryStringToJSON();
    if (querystringJSON.hasOwnProperty('pn') && parseInt(querystringJSON.pn) > 1) {
        $('#previous-page-item').removeClass('disabled')
    } else {
        $('#previous-page-item').addClass('disabled')
    }
})

function QueryStringToJSON() {            
    var pairs = location.search.slice(1).split('&');
    
    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    return JSON.parse(JSON.stringify(result));
}