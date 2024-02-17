console.log("hello world");
require('./calc.js');

$(document).ready(function() {

    //const data_payload = [] ;
    var hsclasses;
    var year_var = 2022 ;
    //var json_file = year_var + '.json';

    $.getJSON('./2022.json', function(data) {

        hsclasses = data['hsclasses'][0] ;         

    //console.log('<div class="row row_pad"><div class="col-md-4 col-xs-4 col-lg-4 col-sm-4 text-center"><select id="class" name="class" class="form-control" onchange="getAgg(this.form, ' + data_payload['hsclasses'] + ',">)');
        //var gfg = JSON.stringify(data);

    var select = '';
    for (var i = 1; i <= 8; i++) {
        //console.log(i);
        select += '<div class="row row_pad"><div class="col-md-4 col-xs-4 col-lg-4 col-sm-4 text-center"><select id="class' + i + '" name="class' + i + '" class="form-control" onchange="getAgg(this.form,' + year_var + ',' + i +' )">' + 
                '<option value="">Select Subject</option></select></div>' + 
            '<div class="col-md-2 col-xs-2 col-lg-2 col-sm-2 text-center"><input class="form-control" type="number" id="raw' + i + '" name="raw' + i + '" min="0" max="50" class="rawScore" onchange="getAgg(this.form, 2022, 0)" style="text-align:center;"></div>' + 
            '<div class="col-md-2 col-xs-2 col-lg-2 col-sm-2 text-center"><input class="form-control" type="text" id="class' + i + 'result" name="class' + i + 'result" disabled="disabled" style="text-align:center;" size="3"/></div>' +
            //'<div class="col-md-0 col-xs-0 col-lg-0 col-sm-0"><label type="hidden" class="sr-only" id="scaling' + i + '">+0</label></div>' +
            '<div class="col-md-2 col-xs-2 col-lg-2 col-sm-2 text-center"><input class="form-control" type="text" id="used_as' + i + 'result" name="used_as' + i + 'result" disabled="disabled" style="text-align:center;" size="3"/></div>' +
            '<div class="col-md-2 col-xs-2 col-lg-2 col-sm-2 text-center"><input class="form-control" type="text" id="agg_contribution' + i + 'result" name="agg_contribution' + i + 'result" disabled="disabled" style="text-align:center;" size="3"/></div>' +
            '</div>' ;

    };

    //console.log(hsclasses);
    var count = Object.keys(hsclasses).length;
    //console.log(count);
    //console.log(data['hsclasses'].length);
    
    $('#main').html(select);

    for (var j = 1; j <=8 ; j++) {
        var selectElement = $('#class' + j);
        if (j==1) {
            selectElement.append($('<option>', {value: 'EN', text: 'English'}));
            selectElement.append($('<option>', {value: 'EF', text: 'English (EAL)'}));
            selectElement.append($('<option>', {value: 'EG', text: 'English Language'}));
            selectElement.append($('<option>', {value: 'LI', text: 'Literature'}));
        } else {


        for (var key in hsclasses) {
            //console.log(hsclasses[key].name)
            selectElement.append($('<option>', {
                value: key,
                text: hsclasses[key].name
            }));
        }
    }
    }

});

$.getJSON('./course_details.json', function(courses) {
  console.log(courses[0]);

  $('#oTable').dataTable({
    order: [[4, "desc" ]] ,
    lengthMenu: [ 25, 50, 75, 100 ],
    processing : true ,
    data : courses,
    columnDefs: [   
        {targets : [2], searchable:false },
        {targets : [4], visible: false },
        {targets: [3], render: function ( data, type, row ) {
            if (data == 0) { return data //'L/N'
        } 
            else if (data == 1) {return 'N/P'} 
            else {return data} 
        }},
        {targets: [5],
            render: function ( data, type, row ) {
            return '<a href="' + row[5] + '" target="_blank">View Course Details</a>';
        }  
    } 
]
} );

})




});
