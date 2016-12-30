STATES ={
    SELECT:0,
    FEEDBACK:1,
    COURSE:2,
    SECTION:3,
    TA:4,
    ASSIGN:5,
    DATA:6
}
var state = 0;
$( ".action_selecter" ).change(function() {
	state = parseInt($(".action_selecter").val());
	hideAll();
	switch(state){
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
			updateTASlct();
			$('.course_list').show();
			$('.section_list').show();
			$('.ta_list').show();
			$('.submit_button').show();
			break;
        case STATES.DATA:
            $('.data_view').show();

            break;
    }
});

$( ".course_selecter" ).change(function() {
	if(state == STATES.SECTION){
		return; // do nothing
	}
    if($(".course_selecter").val() == "None") {
        $('.section_selecter').html('');
        return; // do nothing
    }
    $.post("/getSections",{ coursecode : $(".course_selecter").val() },
        function(data, status){
            var section_selecter = $(".section_selecter");
            section_selecter.val("");
            section_selecter.html('');
            data = $.parseJSON(data);
            sections_selecter.append('<option value="None">None</option>');
            for(let time of data.results){
                sections_selecter.append('<option value="'+time+'">'+time+'</option>');
            }
            $('#course_code').val($(".course_select").val());
        });
});

$(document.body).on('submit','.manage',function(event) {
	event.preventDefault();
	switch(state){
		case STATES.FEEDBACK:
			//TODO: Add get feedback post request
			$.post('/getFeedbacks', null, function(data, status) {
				var schema = data['feedback']['schema'];
				var obj = {
				   schema: schema,
				   rows: []
				}

				$.each(data['feedback'], function(ta, stats) {
					// create title for table
					var course = stats['course'];
					var section = stats['section'];
					var starTime = stats['startTime'];
					var endTime = stats['endTime'];
					var feedback = stats['feedback'];

					// create object containing rows, so we can write to the table
					$.forEach(feedback,function(stat) {
						var q1 = stat['q1'];
						var q2 = stat['q2'];
						var q3 = stat['q3'];
						var notes = stats['feedback'];
						obj.rows.push([q1, q2, q3, notes]);
					});
					createTable(obj);
				});
			});
			break;
		case STATES.COURSE:
			//TODO: Add create course post request
			var data = {
				courseCode : $(".addCourse").find("input[name='courseCode']").val()
			};
			$.post("/createCourse",data,function(data, status){
				//TODO: Handle submission
				alert("sent");
			});
			break;
		case STATES.SECTION:
			//TODO: Add create section post request
			var data = {
				courseCode : 	$(".course_selecter").val() ,
				sectionCode : 	$(".addSection").find("input[name='sectionCode']").val(),
				year : 			$(".addSection").find("input[name='year']").val(),
				semester : 		$(".addSection").find("input[name='semester']").val(),
				weekday : 		$(".addSection").find("input[name='weekday']").val(),
				startTime : 	$(".addSection").find("input[name='startTime']").val(),
				endTime : 		$(".addSection").find("input[name='endTime']").val()
			};
			$.post("/createSection",data,function(data, status){
				//TODO: Handle submission
				alert("sent");
			});
			break;
		case STATES.TA:
			var data = {
				fname : $(".addTA").find("input[name='fname']").val(),
				lname : $(".addTA").find("input[name='lname']").val(),
				stnum : $(".addTA").find("input[name='stnum']").val(),
				profilepic : $(".addTA").find("input[name='profilePic']").val()
			};
			$.post("/createTA",data,function(data, status){
				//TODO: Handle submission
				alert("sent");
			});
			break;
		case STATES.ASSIGN:
			//TODO: Add assign ta post request
			var data = {
				courseCode : $(".course_selecter").val() ,
				sectionCode : $(".section_selecter").val(),
				taID : $(".ta_selecter").val()
			};
			$.post("/asssignTA",data,function(data, status){
				//TODO: Handle submission
				alert("sent");
			});
			break;
	}
});

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

function updateTASlct(){
	$.post("/getTA",{th : "lolright"},
		function(data, status){
			var ta_selecter = $(".ta_selecter");
			ta_selecter.html('');
			data = $.parseJSON(data);
			ta_selecter.append('<option value="None">None</option>');
			for(let ta of data.results){
				ta_selecter.append('<option value="'+ta[0]+'">'+ta[1]+'</option>');
			}
		});
}

function hideAll(){
	$('.course_list').hide();
	$('.section_list').hide();
	$('.ta_list').hide();
	$('.addCourse').hide();
	$('.addSection').hide();
	$('.addTA').hide();
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
