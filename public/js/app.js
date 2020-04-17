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

    let pageContainer = $('#posts-pagination')
    if (pageContainer.length) {

        let qsJSON = QueryStringToJSON();
        
        let basePostUrl = (pageContainer.data('post-search') === undefined) ? '/user/posts/getall' : '/user/post/search'
        if (pageContainer.data('post-search') === undefined) {
            $.LoadingOverlay("show");
            $.getJSON(basePostUrl, function (data) {
                $("table#posts-table tbody").html(populateRows(data));
                $.LoadingOverlay("hide");
            })
        } else {
            $.LoadingOverlay("show");
            $.getJSON(basePostUrl + '?qs=' + qsJSON.qs, function (data) {
                $("table#posts-table tbody").html(populateRows(data));
                $.LoadingOverlay("hide");
            })
        }

        let bootpag = $('#posts-pagination').bootpag({
            total: pageContainer.data('total-posts'),
            prev: 'Previous',
            next: 'Next',
            wrapClass: 'pagination',
            activeClass: 'page-item active',
            disabledClass: 'page-item disabled',
            nextClass: 'page-item',
            prevClass: 'page-item'
        })
        
        bootpag.on("page", function(event, num){
            if (pageContainer.data('post-search') === undefined) {
                $.LoadingOverlay("show");
                $.getJSON(basePostUrl + '?pn=' + num, function (data) {
                    $("table#posts-table tbody").html(populateRows(data));
                    $.LoadingOverlay("hide");
                })
            } else {
                $.LoadingOverlay("show");
                $.getJSON(basePostUrl + '?qs=' + qsJSON.qs + '&pn=' + num, function (data) {
                    $("table#posts-table tbody").html(populateRows(data));
                    $.LoadingOverlay("hide");
                })
            }
        });

        // Make Bootstrap 4 compatible --- bootpag work well with bootstrap 3
        $('ul.pagination li').addClass('page-item');
        $('ul.pagination a').addClass('page-link');
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

function populateRows(data) {
    let postRowsHtml = ''
    let index = 1
    data.posts.forEach(function(post) {
        postRowsHtml += `
            <tr>
                <td>${index++}</td>
                <td>${post.title}</td>
                <td>${post.category}</td>
                <td>${post.createdAt}</td>
                <td>
                    <a href="/user/post/details?_id=${post._id}" class="btn btn-secondary">
                        <i class="fas fa-angle-double-right"></i> Details
                    </a>
                </td>
            </tr>
        `
    })
    return postRowsHtml
}