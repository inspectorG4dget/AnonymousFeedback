STATES ={
	SELECT:0,
	FEEDBACK:1,
	COURSE:2,
	SECTION:3,
	TA:4,
	ASSIGN:5
}

$( ".action_selecter" ).change(function() {
	var action = parseInt($(".action_selecter").val());
	hideAll();
	switch(action){
		case STATES.FEEDBACK:
			updateCourseSlct();
			$('.course_list').show();
			$('.section_list').show();
			$('.submit_button').show();
			break;
		case STATES.COURSE:
			$('.addCourse').show();
			$('.submit_button').show();
			break;
		case STATES.SECTION:
			updateCourseSlct();
			$('.course_list').show();
			$('.addSection').show();
			$('.submit_button').show();
			break;
		case STATES.TA:
			$('.addTA').show();
			$('.submit_button').show();
			break;
		case STATES.ASSIGN:
			updateCourseSlct();
			$('.course_list').show();
			$('.section_list').show();
			$('.ta_list').show();
			$('.submit_button').show();
			break;
	}
});

$( ".course_selecter" ).change(function() {
	alert("oy");

    if($(".course_selecter").val() == "None") {
		alert("oy");
        $('.section_selecter').html('');
        return;
    }
    $.post("/getSections",{ coursecode : $(".course_selecter").val() },
        function(data, status){
            var section_selecter = $(".section_selecter");
            section_selecter.val("");
            section_selecter.html('');
            data = $.parseJSON(data);
			section_selecter.append('<option value="None">None</option>');
            for(let time of data.results){
				section_selecter.append('<option value="'+time+'">'+time+'</option>');
            }
            $('#course_code').val($(".course_select").val());
        });
});
$('.feedback').on('submit',function(event){
        event.preventDefault() ;
		formdata={
			'course' : $(".course_selecter").val(),
			'section' : $(".sections_list").val()
		}
		$.post('/viewFeedBack',formdata, function(data,status) {
				createTable($.parseJSON(data));
			}
		)
});

$(document.body).on('change','.section',function() {
    if ($("input[name='section']").is(':checked')) {
        $('.feedback').show();
        $('#section_code').val($("input[name='section']:checked").val());
    }
});

function hideAll(){
	$('.course_list').hide();
	$('.section_list').hide();
	$('.ta_list').hide();
	$('.addCourse').hide();
	$('.addSection').hide();
	$('.addTA').hide();
}

function test(){
	var data = {
		schema : [
			'person', 'id'
		],
		rows : [
			['Ashwin','45'],
			['PineApple','pen']
		]
	}
	createTable(data);
	$('.data_view').show();
}

function updateCourseSlct(){
	$.post("/getCourses",{th : "lolright"},
		function(data, status){
			var course_selecter = $(".course_selecter");
			course_selecter.html('');
			data = $.parseJSON(data);
			course_selecter.append('<option value="None">None</option>');
			for(let code of data.results){
				course_selecter.append('<option value="'+code+'">'+code+'</option>');
			}
		});
}

function createTable(data){
	var schema = data.schema;
	var table = $('.data_view')
	table.html('')
	table.append('<table><tr>')
	for(let header of schema){
		table.append('<th>'+header+'</th>')
	}
	table.append('</tr>')
	for(let row of data.rows){
		table.append('<tr>')
		for(let col of row){
			table.append('<td>'+col+'</td>');
		}
		table.append('</tr>')
	}
	table.append('</table>')
	$('.data_view').show();
}
