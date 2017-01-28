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

// fetches course sections from the /getSections endpoint given a course code
$( ".course_selecter" ).change(function() {
	if(state == STATES.SECTION){
		return; // do nothing
	}

	// no course is selected
    if($(".course_selecter").val() === "None") {
        $('.section_selecter').html('');
        return; // do nothing
    }

    // a course is selected, fetech data from the API and load it into a table
    $.post("/getSections",{ coursecode : $(".course_selecter").val() },
        function(data, status){
			
			// data is returned as a 1-key dict with a list of lists
			var sections = $.parseJSON(data)['results'];

			// query DOM for section selector dropdown
			var section_selector = $('.section_selecter');

			// clear the section dropdown as it may store previous sections
			section_selector.empty();

			// load the sections into the next dropdown
			for (var i = 0; i < sections.length; i++) {
				var option = document.createElement('option');
				option.value = sections[i][0];
				option.innerHTML = sections[i][0];
				section_selector.append(option);
			}
        });
});

// helper function used to generate table rows of a given width `w`.
// helps avoid too-deeply nested functions inside onsubmit handler.
// loads cells `w` cells into a list to be manipulated directly
function generateTableRow(w) {
	var rp = []
	for (var i = 0; i < w; i++) {
		rp.push(document.createElement('td'));
	}
	return rp;
}

// GUM (grand unified multiplexer) for handling form submissions in the Professor view
// essentially a big multiplexer
$(document.body).on('submit','.manage',function(event) {
	event.preventDefault();	

	switch(state){

		// feedback is requested for a given section
		case STATES.FEEDBACK:
			var table = document.getElementsByClassName('data_table')[0];
			table.innerHTML = '';
	
			// scrape form data
			var data = {
				courseCode : $(".course_selecter").val() ,
				sectionCode : $(".section_selecter").val()
			};

			// send Ajax request to /viewFeedback endpoint
			$.post('/viewFeedBack', data, function(raw_data, status) {

				// save table schema
				var resp = {
				   schema : $.parseJSON(raw_data).data.schema,
				   data : $.parseJSON(raw_data).data.feedbacks,
				};
	
				// load feedback into an HTML table
				// c_ta is a single TA object
				resp.data.map(function(c_ta, i, _) {
				
					// initialize and load headers
					var table_header = document.createElement('tr');
					
					resp.schema.map(function(cv, i, _) {
						var node = document.createElement('th');
						node.innerHTML = cv;
						table_header.appendChild(node);
					});
					
					table.appendChild(table_header);

					// map over a TA's feedback list (of lists)
					c_ta.feedback.map(function(c_fb, j, _) {
						
						// create _n_ raw table cells
						var trp = generateTableRow(resp.schema.length);
						var tr = document.createElement('tr');	

						// map over the individual feedback items
						// load them into cells and drop them into a row
						c_fb.map(function(c_col, k, _) {
							trp[k].innerHTML = c_col;
							tr.appendChild(trp[k]);
						});

						// append the row to a table
						table.appendChild(tr);
					});
				});
	
				document.getElementsByClassName('data_view')[0].style.display = 'block';
			});
			break;

		// course list is requested
		case STATES.COURSE:
			//TODO: Add create course post request
			var data = {
				courseCode : $(".addCourse").find("input[name='courseCode']").val()
			};
			$.post("/addCourse",data,function(data, status){
				//TODO: Handle submission
				alert("sent");
			});
			break;

		// a listing of sections of a course is requested
		case STATES.SECTION:
			//TODO: Add create section post request
			var data2 = {
				courseCode : 	$(".course_selecter").val() ,
				sectionCode : 	$(".addSection").find("input[name='sectionCode']").val(),
				year : 			$(".addSection").find("input[name='year']").val(),
				semester : 		$(".semester_selecter").val(),
				weekday : 		$(".weekday_selecter").val() ,
				startTime : 	$(".addSection").find("input[name='startTime']").val(),
				endTime : 		$(".addSection").find("input[name='endTime']").val()
			};
			$.post("/addSection",data2,function(data2, status){
				//TODO: Handle submission
				alert("sent");
			});
			break;

		// a list of TAs is requested
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

		// ?
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
