var tas= [];
$( ".course_select" ).change(function() {
    if($(".course_select").val() == "None") {
        $('.sections_list').html('');
        return;
    }
	var course_code = $(".course_select").val();
    $.get("/getSections",{ coursecode : course_code },
        function(data, status){
            var sections_list = $(".sections_list");
            $('#section_code').val("");
            sections_list.html('');
            data = $.parseJSON(data);
            for(let section of data.results){
                sections_list.append(course_code+section[0]+": "+section[1]+" - "+section[2]);
                sections_list.append($("<input class=\"section_select\"type=\"radio\" name=\"section\" value=\""+section[0]+"\" />"));
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
		input = {
			course : $("input[name=course_code]").val(),
			section : $("input[name=section_code]").val()
		};
		$.get("/getSectionTAs",input,function(data,status){
			data = $.parseJSON(data);
			var fields = $(".fields");
			fields.html('');
			tas =[];
			for(let ta of data.TAs){
				var name = ta.name.replace(/\s/g, '');

				tas.push({name:ta.name,id:ta.taID});
				fields.append("<h3>"+ta.name+"</h3>");
				a = "<table>"+
"					<tr>"+
"						<th>How often was the TA prepared?</th><td>"+
"						<select id='"+name+"range_1'name='range_1'>"+
"							<option value=1> Never          </option>"+
"							<option value=2> Sometimes      </option>"+
"							<option value=3> Usually        </option>"+
"							<option value=4> Almost Always  </option>"+
"							<option value=5> Always         </option>"+
"						</select></td>"+
"					</tr>"+
"					<tr>"+
"						<th>How well does the TA know the subject material?</th><td>"+
"						<select id='"+name+"range_2' name='range_2'>"+
"							<option value=1>Not at all          </option>"+
"							<option value=2>Slacking Knownledge </option>"+
"							<option value=3>Knows enough        </option>"+
"							<option value=4>Knows the material  </option>"+
"							<option value=5>Expert              </option>"+
"						</select></td>"+
"					</tr>"+
"					<tr>"+
"						<th>How relevant was lab/DGD material to class?</th>"+
"						<td><select id='"+name+"range_3' name='range_3'>"+
"							<option value=1>Not at all</option>"+
"							<option value=2>A little</option>"+
"							<option value=3>Sees some content</option>"+
"							<option value=4>Sees most content</option>"+
"							<option value=5>Perfect for content</option>"+
"						</select></td>"+
"					</tr>"+
"					<tr>"+
"						<th>Feedback about the TA</th>"+
"						<td><textarea rows=10 cols=30 id='"+name+"feed' name='taFeedback'></textarea></td>"+
"					</tr>"+
"				</table>";
				fields.append(a);
			}
			fields.append("<input type='submit' value='Submit' />");
		})
    }
});
$(function(){
	$('.feedback_form').on('submit',function(event){
        	event.preventDefault() ;
			f = []
			for(let ta of tas){
				var name = ta.name.replace(/\s/g, '');
				var feedback = {
					taID : ta.id,
					q1 : $(document.getElementById(name+"range_1")).val(),
					q2 : $(document.getElementById(name+"range_2")).val(),
					q3 : $(document.getElementById(name+"range_3")).val(),
					feedback : $(document.getElementById(name+"feed")).val()
				}
				f.push(feedback);
			};
			data = {
				student : $("input[name=studnum]").val(),
				course : $("input[name=course_code]").val(),
				section : $("input[name=section_code]").val(),
				feedback : f
			};
			$.post("/submitFeedBack",JSON.stringify(data),function(data,status){
				//TODO : Give user visual confirmation
				alert("Success");
			});
	});
});
