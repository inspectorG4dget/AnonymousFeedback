$( ".course_select" ).change(function() {
	$.post("/course",
       {
		   coursecode : $(".course_select").val()
       },
       function(data, status){
		   var sections_select = $(".section_select");
	   		data = $.parseJSON(data);
		   for(let time of data.results){
			   sections_select.append(time);
    			sections_select.append($("<input type=\"radio\" name=\"section\"/>").val(time));
				sections_select.append("<br>");
			}

			$('#course_code').val($(".course_select").val());
			$('.section').show();
       });
});
$( ".section_select").change(function() {
	if($(".section_select").val() != "None" ){
		$('.feedback').show();
		$('#section_code').val($(".section_select").val());
	} else {
		$('#section_code').val("");
		// Else show some error(?)
	}
});
