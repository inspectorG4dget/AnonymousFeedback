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
			$('.feedback_tools').show();
			break;
		case STATES.COURSE:
			$('.course_tools').show();
			break;
		case STATES.SECTION:
			$('.section_tools').show();
			break;
		case STATES.TA:
			$('.ta_tools').show();
			break;
		case STATES.ASSIGN:
			$('.assign_tools').show();
			break;
	}
});

$( ".course_selecter" ).change(function() {
    if($(".course_selecter").val() == "None") {
        $('.sections_list').html('');
        return;
    }
    $.post("/getSections",{ coursecode : $(".course_selecter").val() },
        function(data, status){
            var sections_list = $(".sections_list");
            $('#section_code').val("");
            sections_list.html('');
            data = $.parseJSON(data);
			sections_list.append('<option value="None">None</option>');
            for(let time of data.results){
				sections_list.append('<option value="'+time+'">'+time+'</option>');
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
	$('.feedback_tools').hide();
	$('.course_tools').hide();
	$('.section_tools').hide();
	$('.ta_tools').hide();
	$('.assign_tools').hide();
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
