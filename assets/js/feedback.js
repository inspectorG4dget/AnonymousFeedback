$( ".course_select" ).change(function() {
	alert($(".course_select").val());
	alert( "Handler for .change() called." );
	$.post("/course",
       {
		   coursecode : $(".course_select").val()
       },
       function(data, status){
           alert("Data: " + data + "\nStatus: " + status);

		   var sections_select = $(".course_section");
	   alert(typeof(data));
		   for(let time of data){
			   alert(time);
    			sections_select.append($("<option />").val(time).text(time));
			}
			$('.section').show();
       });
});
$( ".section_select" ).change(function() {

	$('.feedback').show();
});
