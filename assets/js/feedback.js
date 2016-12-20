$( ".course_select" ).change(function() {
    $.post("/course",{ coursecode : $(".course_select").val() },
        function(data, status){
            var sections_list = $(".sections_list");
            $('#section_code').val("");
            sections_list.html('');
            data = $.parseJSON(data);
            for(let time of data.results){
                sections_list.append(time);
                sections_list.append($("<input class=\"section_select\"type=\"radio\" name=\"section\" value=\""+time+"\" />"));
                sections_list.append("<br>");
            }
            $('#course_code').val($(".course_select").val());
            $('.section').show();
        });
});
$(document.body).on('change','.section',function() {
    if ($("input[name='section']").is(':checked')) {
        $('.feedback').show();
        $('#section_code').val($("input[name='section']:checked").val());
    }
});
