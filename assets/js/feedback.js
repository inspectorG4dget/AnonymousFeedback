$( ".course_select" ).change(function() {
	$.post("/course",
       {
		   coursecode : $(".course_select").val()
       },
       function(data, status){
		   var sections_list = $(".sections_list");
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
	alert();
	if ($("input[name='section']").is(':checked')) {
		alert($("input[name='section']:checked").val());
		$('.feedback').show();
		$('#section_code').val($("input[name='section']:checked").val());
	}
});
