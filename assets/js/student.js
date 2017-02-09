"use strict";

var active_tab = null;
var active_tab_number = 0;

/***************************************************************
 * Helper function to update the view based on nav interaction *
 ***************************************************************/
function init_view(container_id) {
	
	// find all top-level nodes in `body`
	var body_child_nodes = [...document.getElementsByTagName('body')[0].children];
	body_child_nodes.map((node, iter, _) => {

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

function reset_btn(btn, reset_text) {
	btn.className = "btn btn-primary btn-block";
	btn.innerHTML = reset_text;
}

function animate_failure(btn, fail_text, reset_text) {
	btn.style.transition = '0.25s linear';
	btn.className = "btn btn-danger btn-block";
	btn.innerHTML = fail_text;
	setTimeout(() => {
		reset_btn(btn, reset_text);
	}, 2000);
}

/*******************************
 * Main initializaiton routine *
 * *****************************/

let submit_feedback_view 	= document.getElementById('nav_feedback');
let profiles_view			= document.getElementById('nav_profiles');

submit_feedback_view.addEventListener('click', (e) => {
	active_tab_number = 0;

	init_view('send_feedback');
	activate_tab('nav_feedback');

	get_courses('select_course_0', [populate_select, get_sections]);
});

let click = new Event('click');
let nav = [submit_feedback_view, profiles_view];

nav.map((curr_tab, i, _) => {
	if ( curr_tab.parentNode.classList.toString() === 'active' ) {
		nav[i] = 1;
		curr_tab.dispatchEvent(click);
	} else {
		nav[i] = 0;
	}
});

let submit_btn_0 = document.getElementById('submit_btn_0');
let input_student_number_0 = document.getElementById('input_student_number_0');
let select_course_0 = document.getElementById('select_course_0');
let select_section_0 = document.getElementById('select_section_0');
let select_ta_0 = document.getElementById('select_ta_0');

let select_section_toggle_0 = new Event('toggle_enabled');

select_course_0.addEventListener('change', (e) => {
	get_sections(select_course_0.value, 'select_section_0', populate_select);
});

select_section_0.addEventListener('change', (e) => {
	get_ta(select_course_0.value, select_section_0.value, (resp) => {
		let ta_ids = [];
		let ta_names = [];

		resp.map((curr_ta, _, __) => {
			ta_ids.push(curr_ta.taID);
			ta_names.push(curr_ta.name);
		});

		if ( resp.length  > 1 ) {
			populate_select( select_ta_0, ta_ids, ta_names );
			select_ta_0.disabled = false;
		} else if ( resp.length === 1 ) {
			populate_select( select_ta_0, ta_ids, ta_names );
			select_ta_0.disabled = true;
		} 
	});
});

input_student_number_0.addEventListener('input', (e) => {
	if ( input_student_number_0.value.length < 7 ) {
		if ( input_student_number_0.value.length === 0 ) {
			submit_btn_0.disabled = true;
			submit_btn_0.innerHTML = 'Input a student number';
			return;
		}
		submit_btn_0.disabled = true;
		submit_btn_0.innerHTML = 'Invalid student number';
	} else {
		submit_btn_0.disabled = false;
		submit_btn_0.innerHTML = 'Submit Feedback';
	}
});


let q1_0 = document.getElementById('q1_0');
let q1_val_0 = document.getElementById('q1_val_0');
let q2_0 = document.getElementById('q2_0');
let q2_val_0 = document.getElementById('q2_val_0');
let q3_0 = document.getElementById('q3_0');
let q3_val_0 = document.getElementById('q3_val_0');
let feedback_input_0 = document.getElementById('feedback_0');

q1_val_0.innerHTML = 'Currently: ' + q1_0.value;
q2_val_0.innerHTML = 'Currently: ' + q2_0.value;
q3_val_0.innerHTML = 'Currently: ' + q3_0.value + ')';

q1_0.addEventListener('change', (e) => {
	q1_val_0.innerHTML = 'Currently: ' + q1_0.value;
});
q2_0.addEventListener('change', (e) => {
	q2_val_0.innerHTML = 'Currently: ' + q2_0.value;
});
q3_0.addEventListener('change', (e) => {
	q3_val_0.innerHTML = 'Currently: ' + q3_0.value + ')';
});

submit_btn_0.addEventListener('click', (e) => {

	// basic client-side input validation 
	if ( !input_student_number_0.value.match(/^\d{7}$/) ) {
		animate_failure( submit_btn_0, 'Invalid student number', 'View Feedback' );
	} else if ( !select_course_0.value.toUpperCase().match(/^[A-Z]{3}\d{4}$/) ) {
		animate_failure( submit_btn_0, 'Invalid course code', 'View Feedback' );
	} else if ( select_section_0.value === '' ) {
		animate_failure( submit_btn_0, 'Invaid section ID', 'View Feedback' );
	} else if ( select_ta_0.value === '' ) {
		animate_failure( submit_btn_0, 'Invalid TA name', 'View Feedback' );
	} else if ( q1_0.value < 0 || q1_0.value > 10 ) {
		animate_failure( submit_btn_0, 'Invalid value for question 1', 'View Feedback' );
	} else if ( q2_0.value < 0 || q1_0.value > 10 ) {
		animate_failure( submit_btn_0, 'Invalid value for question 2', 'View Feedback' );
	} else if ( q3_0.value < 0 || q1_0.value > 10 ) {
		animate_failure( submit_btn_0, 'Invalid value for question 3', 'View Feedback' );
	}

	submit_feedback(
			input_student_number_0.value,
			select_course_0.value,
			select_section_0.value,
			select_ta_0.value,
			q1_0.value,
			q2_0.value,
			q3_0.value,
			feedback_input_0.value
		);
});

// used to populate a dropdown list (`select_id`) with data from an array (`data`)
//
// data_v are value data; data_d are display data
function populate_select(dropdown, data_v, data_d=null) {
	if ( data_d === null ) {
		data_d = data_v;
	}

	clear_select(dropdown);

	//let dropdown = document.getElementById(select_id);
	data_v.map((curr_data, i, _) => {
		let opt = document.createElement('option');
		opt.innerHTML = data_d[i];
		opt.value = curr_data;
		dropdown.appendChild(opt);
	});

	// populate the TA list if it's visible
	if ( dropdown.id === 'select_section_0' ) {
		
		// get a list of TA ID objects and have a callback compile them into an array
		get_ta( select_course_0.value, select_section_0.value, (vs) => {
			let ta_ids = [];
			let ta_names = []
			vs.map((cv, _, __) => {
				ta_names.push(cv.name);
				ta_ids.push(cv.taID);
			});

			if ( ta_names.length === 0 ) {
				ta_ids = [-1];
				ta_names = ['No TAs available for this section or course'];
			}


			// then update the ta selector dropdown
			populate_select( select_ta_0, ta_ids, ta_names );
			//select_ta_0.disabled = true;

			if ( ta_ids.length > 1 ) {
				select_ta_0.disabled = false;
			} else {
				select_ta_0.disabled = true;
			}
		});
	}
}

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
			if ( resp.length > 0 ) {
				callback(dropdown, resp.map((elem) => { return elem[0] }));
				dropdown.disabled = false;
			} else {
				// acquire and disable the submission button
				submit_btn_0.disabled = true;
				submit_btn_0.innerHTML = 'Select a section';

				// update the dropdown with an informative message
				let opt1 = document.createElement('option');
				opt1.value = '';
				opt1.innerHTML = 'No sections available for this course';
				//select_ta_0.parentNode.style.display = 'none';
				clear_select( select_ta_0 );

				// reset certain UI elements
				clear_select( dropdown );
				dropdown.appendChild(opt1);

				let opt2 = document.createElement('option');
				opt2.value = '';
				opt2.innerHTML = 'No TAs available for this section or course';
				select_ta_0.disabled = true;
				select_ta_0.appendChild(opt2);

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
			console.log('foo');
			if ( resp.length > 0 ) {
				q1_0.disabled = false;
				q2_0.disabled = false;
				q3_0.disabled = false;
				feedback_0.disabled = false;
				submit_btn_0.disabled = false;
				submit_btn_0.innerHTML = 'Submit Feedback';
			} else {
				q1_0.disabled = true;
				q2_0.disabled = true;
				q3_0.disabled = true;
				feedback_0.disabled = true;
				submit_btn_0.disabled = true;
				submit_btn_0.innerHTML = 'Select a TA';
				clear_select(select_ta_0);
				let empty_dropdown = document.createElement('option');
				empty_dropdown.innerHTML = 'No TAs available for this section or course';
				select_ta_0.appendChild(empty_dropdown);
			}
		}
	}
	xhr.open('GET', '/getSectionTAs?course_code=' + course + '&section_id=' + section);
	xhr.send();
}

function submit_feedback(student_number, course_code, section_id, ta_id, q1, q2, q3, feedback) {
	if ( section_id != '' && ta_id != '' ) {
		let xhr = new XMLHttpRequest();
		xhr.open('POST', '/submitFeedback?course_code=' + course_code + '&section_id=' + section_id
				+ '&ta_id=' + ta_id + '&student_number=' + student_number + '&q1=' + q1 + '&q2=' 
				+ q2 + '&q3=' + q3 + '&feedback=' + feedback);
		xhr.send();
	}
}

