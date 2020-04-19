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

    if ($('#edit-save-post').length) {
        $('#edit-save-post').on('click', function(e) {
            e.preventDefault()
            
            var form = $('#add-post-form')
            form.parsley().validate()
            if (form.parsley().isValid()){
                return form.submit()
            }
        })
        return false
    }

    let paginationContainer = $('.pagination-container')
    if (paginationContainer.length) {

        let qsJSON = QueryStringToJSON();
        
        let baseTargetUrl = (paginationContainer.data('search-page') === undefined) ? paginationContainer.data('target-url') : paginationContainer.data('target-search-url')
        if (paginationContainer.data('search-page') === undefined) {
            $.LoadingOverlay("show");
            $.getJSON(baseTargetUrl, function (data) {
                $("table tbody").html(populateRows(data));
                $.LoadingOverlay("hide");
            })
        } else {
            $.LoadingOverlay("show");
            $.getJSON(baseTargetUrl + '?qs=' + qsJSON.qs, function (data) {
                $("table tbody").html(populateRows(data));
                $.LoadingOverlay("hide");
            })
        }

        let maxVisible = 5
        let totElems = parseInt(paginationContainer.data('total-elems'))
        let docForPage = parseInt(paginationContainer.data('doc-for-page'))
        
        if (Math.ceil(totElems / docForPage) <= 5) {
            maxVisible = Math.ceil(totElems / docForPage)
        }

        if ((totElems / docForPage) == 1) {
            maxVisible = docForPage
        }

        let bootpag = paginationContainer.bootpag({
            total: paginationContainer.data('total-elems'),
            maxVisible: maxVisible,
            prev: 'Previous',
            next: 'Next',
            leaps: true
        })
        
        bootpag.on("page", function(event, num){
            if (paginationContainer.data('search-page') === undefined) {
                $.LoadingOverlay("show");
                $.getJSON(baseTargetUrl + '?pn=' + num, function (data) {
                    $("table tbody").html(populateRows(data, num));
                    $.LoadingOverlay("hide");
                })
            } else {
                $.LoadingOverlay("show");
                $.getJSON(baseTargetUrl + '?qs=' + qsJSON.qs + '&pn=' + num, function (data) {
                    $("table tbody").html(populateRows(data, num));
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

function populateRows(data, num) {
    let rowsHtml = ''
    let index = 1
    if (num !== undefined && num > 1) {
        index = ((num * data.documentsForPage) - data.documentsForPage) + 1
    }
    if (data.type === 'posts') {
        data.posts.forEach(function(post) {
            rowsHtml += `
                <tr>
                    <td>${index++}</td>
                    <td>${post.title}</td>
                    <td>${post.category}</td>
                    <td>${post.createdAt}</td>
                    <td>
                        <a href="/user/post/edit?_id=${post._id}" class="btn btn-secondary">
                            <i class="fas fa-angle-double-right"></i> Details
                        </a>
                    </td>
                </tr>
            `
        })
    } else if (data.type === 'categories') {
        data.categories.forEach(function(category) {
            rowsHtml += `
                <tr>
                    <td>${index++}</td>
                    <td>${category.title}</td>
                    <td>${category.createdAt}</td>
                    <td>
                        <a href="/user/category/edit?_id=${category._id}" class="btn btn-secondary">
                            <i class="fas fa-angle-double-right"></i> Details
                        </a>
                    </td>
                </tr>
            `
        })
    }
    return rowsHtml
}