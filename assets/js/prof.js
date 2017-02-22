"use strict";

// used when updating the navigation bar's "active" tab in `activate_tab`.
var active_tab = null;
var active_tab_number = 0;

/***************************************************************
 * Helper function to update the view based on nav interaction *
 ***************************************************************/
function init_view(container_id) {
	
	// find all top-level nodes in `body`
	var body_child_nodes = [...document.getElementsByTagName('body')[0].children];
	body_child_nodes.map((node, iter) => {

		// filter top-level .container nodes
		if ( node.className === 'container' ) {

			// hide all nodes except those matching the passed ID
			if ( node.id === container_id ) {
				node.style.display = 'block';
			} else {
				node.style.display = 'none';	
			}
		}
	});
}

function activate_tab(tab_id) {
	if ( active_tab != null ) {
		active_tab.className = '';
	}
	document.getElementById(tab_id).parentNode.className = 'active';
	active_tab = document.getElementById(tab_id).parentNode;
}

function clear_select(dropdown) {
	// clear any previous options in the dropdown
	while (dropdown.firstChild) {
		dropdown.removeChild(dropdown.firstChild);
	}	
}

function clear_table(table) {
	let thead = table.getElementsByTagName('thead')[0];
	let tbody = table.getElementsByTagName('tbody')[0];

	while (thead.firstChild) {
		thead.removeChild(thead.firstChild);
	}

	while (tbody.firstChild) {
		tbody.removeChild(tbody.firstChild);
	}
}

function reset_btn(btn, reset_text) {
	btn.className = "btn btn-primary btn-block";
	btn.innerHTML = reset_text;
}

function animate_success(btn, succ_text, timeout, reset_text) {
	btn.style.transition = '0.25s linear';
	btn.className = "btn btn-success btn-block";
	btn.innerHTML = succ_text;
	setTimeout(() => {
		reset_btn(btn, reset_text);
	}, timeout);
}

function animate_failure(btn, fail_text, timeout, reset_text) {
	btn.style.transition = '0.25s linear';
	btn.className = "btn btn-danger btn-block";
	btn.innerHTML = fail_text;
	setTimeout(() => {
		reset_btn(btn, reset_text);
	}, timeout);
}

function average(arr) {
	return arr.reduce((a,b) => { return a+ b }, 0) / arr.length;
}

function median(arr) {
	arr.sort((a, b) => { return a - b } );
	let half = Math.floor(arr.length/2);
	if (arr.length % 2) {
		return arr[half];
	} else {
		return (arr[half - 1] + arr[half]) / 2.0;
	}
}

// credit: derickbaily.com (modified implementation)
function stddev(data) { 
	let avg = average(data);

	let square_diffs = data.map((c_data) => {
		return Math.pow(c_data - avg, 2);
	});

	let avg_square_diff = average(square_diffs);
	let std_dev = Math.sqrt(average(square_diffs));
	return std_dev;
}

var [start_time_valid, end_time_valid] = [false, false];

/************************************
 * The main initialization routine. *
 ************************************/
// references to elements in the menu bar
let view_feedback_view = document.getElementById('nav_feedback');
let add_course_view    = document.getElementById('nav_course'  );
let add_section_view   = document.getElementById('nav_section' );
let add_ta_view        = document.getElementById('nav_ta'      ); 
let assign_ta_view     = document.getElementById('nav_assign'  );

// add click event listeners to menu items
view_feedback_view.addEventListener('click', (e) => {
	active_tab_number = 0;

	init_view('view_feedback');
	activate_tab('nav_feedback');

	// populate the courses dropdown and pass calbacks to populate subsequent ones
	get_courses('select_course_0', [populate_select, get_sections]);
});
add_course_view.addEventListener('click', (e) => {
	active_tab_number = 1;

	init_view('add_course');
	activate_tab('nav_course');
});
add_section_view.addEventListener('click', (e) => {
	active_tab_number = 2;

	init_view('add_section');
	activate_tab('nav_section');

	// populate the course list dropdown
	get_courses('select_course_2', [populate_select]);
});
add_ta_view.addEventListener('click', (e) => {
	active_tab_number = 3;

	init_view('add_ta');
	activate_tab('nav_ta');
});
assign_ta_view.addEventListener('click', (e) => {
	active_tab_number = 4;

	init_view('assign_ta');
	activate_tab('nav_assign');

	get_courses('select_course_4', [populate_select, get_sections]);
	get_tas();
});

// logic used to detect the currently active tab and set page state based on that
let nav = [view_feedback_view, add_course_view, add_section_view, add_ta_view, assign_ta_view];
let click = new Event('click');

nav.map((curr_tab, i) => {
	if ( curr_tab.parentNode.classList.toString() === 'active' ) {
		activate_tab(curr_tab.id);
		curr_tab.dispatchEvent(click);
		nav[i] = 1;
	} else {
		nav[i] = 0;
	}
});

/*************
 * TAB 1 - VIEW FEEDBACK
 * **********/
// add dropdown change listeners where appropriate
let submit_btn_0 = document.getElementById('submit_btn_0');
let select_course_0 = document.getElementById('select_course_0');
let select_section_0 = document.getElementById('select_section_0');
let select_ta_0 = document.getElementById('select_ta_0');

let ta_name_string = document.getElementById('ta_name_0');	
let select_section_toggle_0 = new Event('toggle_enabled');
let stats_table = document.getElementById('stats_table_0');
			
let stats_title_0 = document.getElementById('stats_title_0');
let stats_subtitle_0 = document.getElementById('stats_subtitle_0');
let feedback_title_0 = document.getElementById('feedback_title_0');


select_course_0.addEventListener('change', (e) => {
	clear_table(document.getElementById('data_table_0'));
	clear_table(document.getElementById('stats_table_0'));
	ta_name_string.innerHTML = '';
	get_sections(select_course_0.value, 'select_section_0', populate_select);
	stats_title_0.style.display = 'none'
	stats_subtitle_0.innerHTML = '';
	feedback_title_0.style.display = 'none'
	clear_table(document.getElementById('data_table_0'));
	clear_table(document.getElementById('stats_table_0'));
});

select_section_0.addEventListener('change', (e) => {
	console.log('foo')
	stats_title_0.style.display = 'none'
	stats_subtitle_0.innerHTML = '';
	feedback_title_0.style.display = 'none'
	clear_table(document.getElementById('data_table_0'));
	clear_table(document.getElementById('stats_table_0'));
	ta_name_string.innerHTML = '';
	get_ta(select_course_0.value, select_section_0.value, (resp) => {
		if ( resp.length <= 1 ) {
			select_ta_0.parentNode.style.display = 'none';
		} else if ( resp.length > 1 ) {
			select_ta_0.parentNode.style.display = '';
		}
	});
});

select_ta_0.addEventListener('change', (e) => {
	ta_name_string.innerHTML = '';
	stats_title_0.style.display = 'none'
	stats_subtitle_0.innerHTML = '';
	feedback_title_0.style.display = 'none'
	clear_table(document.getElementById('data_table_0'));
	clear_table(document.getElementById('stats_table_0'));	
});

submit_btn_0.addEventListener('click', (e) => {
	clear_table(document.getElementById('data_table_0'));
	clear_table(document.getElementById('stats_table_0'));
	get_feedback(select_course_0.value, select_section_0.value, select_ta_0.value);
});

/*************
 * TAB 2 - ADD A COURSE
 * **********/
let submit_btn_1 = document.getElementById('submit_btn_1');
let add_course_1 = document.getElementById('add_course_1');

add_course_1.addEventListener('input', (e) => {
	if ( add_course_1.value.toUpperCase().match(/^[A-Z]{3}\d{4}$/) ) {
		submit_btn_1.disabled = false;
	} else {
		submit_btn_1.disabled = true;
	}
});

submit_btn_1.addEventListener('click', (e) => {
	put_course(add_course_1.value);
});

/*************
 * TAB 3 - ADD A SECTION
 * **********/
let course_code_2 = document.getElementById('select_course_2');
let section_id_2 = document.getElementById('add_section_2');
let year_2 = document.getElementById('select_year_2');
let semester_2 = document.getElementById('select_semester_2');
let weekday_2 = document.getElementById('select_weekday_2');
let start_time_2 = document.getElementById('select_starttime_2');
let end_time_2 = document.getElementById('select_endtime_2');

let submit_btn_2 = document.getElementById('submit_btn_2');

section_id_2.addEventListener('input', (e) => {
	if ( section_id_2.value != '' && start_time_valid && end_time_valid ) {
		submit_btn_2.disabled = false;
	} else {
		submit_btn_2.disabled = true;
	}
});

start_time_2.addEventListener('input', (e) => {
	let hours, minutes;
	try {
		[hours, minutes] = start_time_2.value.split(':');
	} catch (e) {
		return;
	}
	if ( start_time_2.value.match(/^\d\d?:\d\d$/) &&
			0 <= hours && hours <= 23 &&
			0 <= minutes && minutes <= 59) {
		start_time_valid = true;
		if ( start_time_valid && end_time_valid && section_id_2.value != '' ) {
			submit_btn_2.disabled = false;
		}
	} else {
		start_time_valid = false;
		submit_btn_2.disabled = true;
	}
});

end_time_2.addEventListener('input', (e) => {
	let hours, minutes;
	try {
		[hours, minutes] = end_time_2.value.split(':');
	} catch (e) {
		return;
	}
	if ( end_time_2.value.match(/^\d\d?:\d\d$/) &&
			0 <= hours && hours <= 23 &&
			0 <= minutes && minutes <= 59) {
		end_time_valid = true;
		if ( start_time_valid && end_time_valid && section_id_2.value != '' ) {
			submit_btn_2.disabled = false;

		}
	} else {
		end_time_valid = false;
		submit_btn_2.disabled = true;
	}
});

submit_btn_2.addEventListener('click', (e) => {	
	put_section(
			course_code_2.value,
			section_id_2.value,
			year_2.value,
			semester_2.value,
			weekday_2.value,
			start_time_2.value,
			end_time_2.value
	);
});

/*************
 * TAB 4 - ADD A TA
 * **********/
let ta_fname_3 = document.getElementById('ta_fname_3');
let ta_lname_3 = document.getElementById('ta_lname_3');
let student_number_3 = document.getElementById('ta_number_3');
let profile_picture_3 = document.getElementById('profile_picture_3');

let submit_btn_3 = document.getElementById('submit_btn_3');

let [ta_fname_valid_3, ta_lname_valid_3, student_number_valid_3, profile_picture_valid_3] = [false, false, false];

ta_fname_3.addEventListener('input', (e) => {
	if ( ta_fname_3.value != '' ) {
		ta_fname_valid_3 = true;
		if ( ta_fname_valid_3 && ta_lname_valid_3 && student_number_valid_3 && profile_picture_valid_3 ) {
			submit_btn_3.disabled = false;
		}
	} else {
		ta_fname_valid_3 = false;
		submit_btn_3.disabled = true;
	}
});

ta_lname_3.addEventListener('input', (e) => {
	if ( ta_lname_3.value != '' ) {
		ta_lname_valid_3 = true;
		if ( ta_fname_valid_3 && ta_lname_valid_3 && student_number_valid_3 && profile_picture_valid_3 ) {
			submit_btn_3.disabled = false;
		}
	} else {
		ta_lname_valid_3 = false;
		submit_btn_3.disabled = true;
	}
});

student_number_3.addEventListener('input', (e) => {
	if ( student_number_3.value.match(/^\d{7}$/) ) {
		student_number_valid_3 = true;
		if ( ta_fname_valid_3 && ta_lname_valid_3 && student_number_valid_3 && profile_picture_valid_3 ) {
			submit_btn_3.disabled = false;
		}
	} else {
		student_number_valid_3 = false;
		submit_btn_3.disabled = true;
	}
});

profile_picture_3.addEventListener('input', (e) => {
	if ( profile_picture_3.value != '' ) {
		profile_picture_valid_3 = true;
		if ( ta_fname_valid_3 && student_number_valid_3 && profile_picture_valid_3 ) {
			submit_btn_3.disabled = false;
		}
	} else {
		profile_picture_valid_3 = false;
		submit_btn_3.disabled = true;
	}
});

submit_btn_3.addEventListener('click', (e) => {
	put_ta(ta_fname_3.value, ta_lname_3.value, ta_number_3.value, profile_picture_3.value);
});

/*************
 * TAB 5 - ASSIGN A TA
 * **********/
let select_course_4 = document.getElementById('select_course_4');
let select_section_4 = document.getElementById('select_section_4');
let select_ta_4 = document.getElementById('select_ta_4');
let submit_btn_4 = document.getElementById('submit_btn_4');

// populate the course list onload
select_course_4.addEventListener('change', (e) => {
	get_sections(select_course_4.value, 'select_section_4', populate_select, 0);
});

submit_btn_4.addEventListener('click', (e) => {
	assign_ta( select_ta_4.value, select_course_4.value, select_section_4.value );
});

/******************************************************
* initialize the correct view based on the active tab *
*******************************************************/
let change = new Event('change');

// TODO figure out if there's a reliable way to dedup this code

// "View Feedback"
if ( nav[0] === 1 ) {
	init_view('view_feedback');
}

// "Add a course"
else if ( nav[1] === 1 ) {
	init_view('add_course');
}

// "Add a section"
else if ( nav[2] === 1 ) {
	init_view('add_section');
}

// "Add a TA"
else if ( nav[3] === 1 ) {
	init_view('add_ta');
}

// "Assign a TA"kj/kk
else if ( nav[4] === 1 ) {
	init_view('assign_ta');
}

else {
	console.log('[ FAIL ] Invalid state value encountered during initialization.');
	console.log('[ INFO ] The application has entered an inconsistent state and ' +
			' correct behaviour is not guaranteed.');
}
//});

// A helper function used when generating a table to display feedback
// loads cells `w` cells into an array to be manipulated directly
function generate_table_row(w) {
	var rp = []
	for (var i = 0; i < w; i++) {
		rp.push(document.createElement('td'));
	}
	return rp;
}

// used to populate a dropdown list (`select_id`) with data from an array (`data`)
//
// data_v are value data; data_d are display data
function populate_select(dropdown, data_v, data_d=null) {
	if ( data_d === null ) {
		data_d = data_v;
	}

	clear_select(dropdown);

	//let dropdown = document.getElementById(select_id);
	data_v.map((curr_data, i) => {
		let opt = document.createElement('option');
		opt.innerHTML = data_d[i];
		opt.value = curr_data;
		dropdown.appendChild(opt);
	});

	// populate the TA list if it's visible
	if ( dropdown.id === 'select_section_0' ) {
		
		// get a list of TA ID objects and have a callback compile them into an array
		get_ta( select_course_0.value, select_section_0.value, (vs) => {
			var tas = [];
			vs.map((cv) => {
				tas.push(cv.name);
			});

			// then update the ta selector dropdown
			if ( tas.length > 1 ) {
				populate_select( select_ta_0, tas );
				select_ta_0.parentNode.style.display = '';
			} else {
				select_ta_0.parentNode.style.display = 'none';
			}
		});
	}
}


/**********************************************
 * AJAX helper functions that hit the AFM API.*
 * Functions which can be repurposed can be   *
 * passed a callback to be called at the end  *
 * of a successful XHR.                       *
 * This is also true of functions which       *
 * perform side-effectful actions after a     *
 * successful XHR.                            *
 **********************************************/
function get_courses(select_id, callbacks) {
	let dropdown = document.getElementById(select_id);
	dropdown.disabled = true;

	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if ( xhr.readyState === 4 && xhr.status === 200 ) {
			let resp = JSON.parse(xhr.responseText)['results'];
			if ( callbacks.length > 0 ) {
				callbacks[0](dropdown, resp);
				dropdown.disabled = false;
				if ( callbacks.length > 1 ) {
					callbacks[1](resp[0], 'select_section_' + select_id[select_id.length - 1], populate_select);
				}
			}
		} else if (xhr.readyState === 4 && xhr.status !== 200 ) {
			let err_node = document.createElement('option');
			err_node.value = 'err';
			err_node.innerHTML = 'Error: could not load a course list.';
			dropdown.appendChild(err_node);
		}
	};
	xhr.open('GET', '/getCourses');
	xhr.send();
}

// TODO remove static references to elements which may not be relevant
function get_sections(course, select_id, callback) {
	let dropdown = document.getElementById(select_id);
	var active;
	if ( active_tab_number === 4 ) {
		active = 0;
	} else {
		active = 1;
	}
	dropdown.disabled = true;
	clear_select(dropdown);

	// validate course formatting before hitting the API with an invalid request
	if ( !course.match(/[A-Za-z]{3}\d{4}$/) ) {
		return;
	}

	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if ( xhr.readyState === 4 && xhr.status === 200 ) {
			let resp = JSON.parse(xhr.responseText)['results'];
			let btn = document.getElementById('submit_btn_0');
			if ( resp.length > 0 ) {
				btn.disabled = false;
				btn.innerHTML = 'View Feedback';
				callback(dropdown, resp.map((elem) => { return elem[0] }));
				dropdown.disabled = false;
			} else {
				// acquire and disable the submission button
				btn.disabled = true;
				btn.innerHTML = 'Select a section';

				// update the dropdown with an informative message
				let opt = document.createElement('option');
				opt.value = '';
				opt.innerHTML = 'No sections available for this course';
				select_ta_0.parentNode.style.display = 'none';
				clear_select( select_ta_0 );

				// reset certain UI elements
				clear_select(dropdown);
				clear_table(document.getElementById('data_table_0'));
				document.getElementById('ta_name_0').innerHTML = '';
				dropdown.appendChild(opt);
			}
		}
	};
	xhr.open('GET', '/getSections?course_code=' + course + '&active=' + active);
	xhr.send();
}

function get_ta(course, section, callback) {
	let resp = null;

	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if ( xhr.readyState === 4 && xhr.status === 200 ) {
			resp = JSON.parse(xhr.responseText)['results'];
			callback(resp);
		}
	}
	xhr.open('GET', '/getSectionTAs?course_code=' + course + '&section_id=' + section);
	xhr.send();
}

function get_tas() {
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if ( xhr.readyState === 4 && xhr.status === 200) {
			let resp = JSON.parse(xhr.responseText);
			let ta_ids = [];
			let ta_names = [];
			resp.results.map((c_ta) => {
				ta_ids.push(c_ta.id);
				ta_names.push(c_ta.name);
			});
			populate_select(document.getElementById('select_ta_4'), ta_ids, ta_names);
		}
	}

	xhr.open('GET', '/getTA');
	xhr.send();
}

function get_feedback(course, section, ta_name=null) {
	if ( !course.match(/[A-Za-z]{3}\d{4}/) || course.length !== 7 ){
		return;
	}

	let xhr = new XMLHttpRequest();
	ta_name_string.innerHTML = '';

	xhr.onreadystatechange = () => {
		if ( xhr.readyState === 4 && xhr.status === 200 ) {

			let resp = JSON.parse(xhr.responseText)['data'];

			// return from the function early if there are no TAs assigned to this section
			// toggle the multi-TA select as appropriate otherwise
			if ( resp['feedbacks'].length == 0 ) {
				animate_failure( submit_btn_0, 'No feedback available for this section', 3000, 'View Feedback' );
				return;
			}

			// spawn a new table
			let table = document.getElementById('data_table_0');
			let thead = table.getElementsByTagName('thead')[0];
			let tbody = table.getElementsByTagName('tbody')[0];
			let th_row = document.createElement('tr');

			// build up the schema as the header row in the table
			resp.schema.map((c_sch) => {
				let cell = document.createElement('th');
				cell.innerHTML = c_sch;
				th_row.appendChild(cell);
			});

			thead.appendChild(th_row);
		
			// filter out the feedback for readability (either flatten array or extract required from array)
			var feedback = null;

			if ( resp.feedbacks.length === 1 ) {
				ta_name_string.innerHTML = resp.feedbacks[0].ta;
				feedback = resp.feedbacks[0].feedback;
			} else {
				resp.feedbacks.map((c_fb) => {
					if ( c_fb.ta === ta_name ) {
						feedback = c_fb.feedback;
						ta_name_string.innerHTML = c_fb.ta;
					}
				});
			}

			// For reach feedback form filled out...
			feedback.map((c_fb) => {
				let tr = document.createElement('tr');
				
				// for each response in a form...
				c_fb.map((c_q) => {
					let td = document.createElement('td');
					td.innerHTML = c_q;
					tr.appendChild(td);
				});

				tbody.append(tr);
			});	
			
			document.getElementById('data_table_0').style.display = '';

			// ETL over quantifiable data (no NLP yet :(...) and loading into a second table
			let q1 = [];
			let q2 = [];
			let q3 = [];

			// for each feedback form filled out...
			feedback.map((c_fb) => {
				q1.push(c_fb[0]);
				q2.push(c_fb[1]);
				q3.push(c_fb[2]);
			});

			let mins = [Math.min.apply(null, q1), Math.min.apply(null, q2), Math.min.apply(null, q3)];
			let maxs = [Math.max.apply(null, q1), Math.max.apply(null, q2), Math.max.apply(null, q3)];
			let avgs = [q1, q2, q3].map((c_arr) => c_arr.reduce((a,b) => { return a + b}, 0) / c_arr.length);
			let meds = [median(q1), median(q2), median(q3)];
			let stddevs = [stddev(q1), stddev(q2), stddev(q3)];

			let stats = [mins, maxs, avgs, meds, stddevs];


			let stats_table = document.getElementById('stats_table_0');
			let stats_table_body = stats_table.getElementsByTagName('tbody')[0];
			let stats_table_header = stats_table.getElementsByTagName('thead')[0];
			let feedback_header = document.getElementById('data_table_0').getElementsByTagName('thead')[0].getElementsByTagName('tr')[0];
			let feedback_header_field = feedback_header.getElementsByTagName('th')[feedback_header.childElementCount - 1];

			stats_table_header.innerHTML = '<tr><th>Question</th><th>Min</th><th>Max</th><th>Avg</th><th>Med</th><th>Stddev</th></tr>';

			for ( let i = 0; i < 3; i++ ) {
				let row = document.createElement('tr');
				let header_cell = document.createElement('td');
				header_cell.innerHTML = '<strong>q' + (i + 1) + '</strong>';
				row.appendChild(header_cell);

				for ( let j = 0; j < 5; j++ ) {
					let cell = document.createElement('td');
					cell.innerHTML = stats[j][i].toFixed(2);
					row.appendChild(cell);
				}

				stats_table_body.appendChild(row);
			}

			if ( feedback.length > 0 ) {
				stats_table.style.display = '';
				stats_title_0.style.display = '';
				stats_subtitle_0.style.display = '';
				if ( feedback.length === 1 ) {
					feedback_header_field.innerHTML = '<strong>feedback <em>(' + feedback.length + ' item)</em></strong>';
					stats_subtitle_0.innerHTML = '<em>Based on ' + feedback.length  + ' feedback item</em>';
				} else {
					feedback_header_field.innerHTML = '<strong>feedback <em>(' + feedback.length + ' items)</em></strong>';
					stats_subtitle_0.innerHTML = '<em>Based on ' + feedback.length  + ' feedback items</em>';
				}
				feedback_title_0.style.display = '';
				
			}
		}	
	}
	xhr.open('GET', '/viewFeedBack?courseCode=' + course + '&sectionCode=' + section);
	xhr.send();
}

function put_course(course_code) {
	let xhr = new XMLHttpRequest();
	let status_span = document.getElementById('status_1');

	xhr.onreadystatechange = () => {
		if ( xhr.readyState === 4 ) {
			switch ( xhr.status ) {
				case 200:
					animate_success( submit_btn_1, 'Success', 2000, 'Submit' );
					add_course_1.value = '';
					break;

				// invalid course name
				case 400:
					animate_failure( submit_btn_1, 'Adding a new course failed: invalid course name', 3000, 'Submit' );
					break;

				//  course already exists
				case 409:
					animate_failure( submit_btn_1, 'Adding a new course failed: course exists', 3000, 'Submit' );
					break;
				
				//  some other type of error
				case 500:
					animate_failure( submit_btn_1, 'Adding a new course failed: an unknown error occurred', 3000, 'Submit' );
					break;
			}
		}
	}
	
	xhr.open('PUT', '/addCourse?course_code=' + course_code);
	xhr.send();
}

// TODO: dedup all this switch/case stuff. Could probably just drop it into a dispatch/triage helper.
function put_section(course_code, section_id, year, semester, weekday, start_time, end_time) {
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if ( xhr.readyState === 4 ) {
			switch (xhr.status) {
				case 200:
					animate_success( submit_btn_2, 'Success', 2000, 'Submit' );
					break;

				case 400:
				case 409:
				case 500:
					let resp = JSON.parse(xhr.responseText);
					animate_failure( submit_btn_2, 'Adding a new section failed: ' + resp.msg, 3500, 'Submit' );
					break;	
			}
		}
	};
	xhr.open('PUT', '/addSection?course_code=' + course_code + '&section_id=' + section_id + '&year=' + year
			+'&semester=' + semester + '&weekday=' + weekday + '&start_time=' + start_time + '&end_time=' + end_time);
	xhr.send();
}

function put_ta(fname, lname, student_no, profile_picture) {
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if ( xhr.readyState === 4 ) {
			switch (xhr.status) {
				case 200:
					animate_success( submit_btn_3, 'Success', 2000, 'Submit' );
					break;

				case 400:
				case 409:
				case 500:
					let resp = JSON.parse(xhr.responseText);
					animate_failure( submit_btn_3, 'Adding a new TA failed: ' + resp.msg, 3500, 'Submit' );
					break;	
			}
		}
	};
	xhr.open('PUT', '/addTA?fname=' + fname + '&lname=' + lname + '&student_no=' + student_no + '&profile_picture=' + profile_picture);
	xhr.send();
}

function assign_ta(ta_id, course_code, section_id) {
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if ( xhr.readyState === 4 ) {
			switch (xhr.status) {
				case 200:
					animate_success( submit_btn_4, 'Success', 2000, 'Submit' );
					break;

				case 400:
				case 409:
				case 500:
					let resp = JSON.parse(xhr.responseText);
					animate_failure( submit_btn_4, 'Adding a new TA failed: ' + resp.msg, 3500, 'Submit' );
					break;	
			}
		}
	};
	xhr.open('POST', '/assignTA?course_code=' + course_code + '&section_id=' + section_id + '&ta_id=' + ta_id);
	xhr.send();
};

