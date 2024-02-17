//////////////////////////////////////////////
// Copyright Notice
// All work copyright Adam Ward 2016-2023
//////////////////////////////////////////////

//updates on class selection
"use strict";
var alerts_on = true; // If alerts are currently allowed. Used to reduce alerts if they've already been given

// 8 subjects plus the increment
var MAX_CLASSES = 9;

var button_select = 0;

// turn off all logging
//console.log = function() {};


// 010 - this function will clear all data in the form
function clearData() {
    var i;
    for (i = 1; i < MAX_CLASSES + 1; i += 1) {
		document.getElementById("class" + i + "result").value = ''; 
        document.getElementById("used_as" + i + "result").value = '';
		document.getElementById("agg_contribution" +i + "result").value = '';
    }
}


// 100 - this is the main driver function to determine which calculations are made
function getAgg(form, year, row, button=2) {

    var data_load
    var json_file = 'js/' + year + '.json';
    //console.log(json_file);

    $.getJSON(json_file, function(data) {
        //console.log(data['hsclasses']);
        data_load = data ;
    
    //var but0 = document.getElementById("butMarks");
    //var but1 = document.getElementById("butATAR");
    //var buttonSelect = document.getElementById("button_select");
    //var goalRow = document.getElementById("goalRow");
    
    // determine if this a Marks to ATAR or ATAR to Marks calc
    var calcButton = button; //document.getElementById("button_select").value
    //var checkDupe;
    
    alerts_on = true;
    
        
    // check if the extension increment is populated and has a value between 3 and 5
    var increment_val =  document.getElementById("raw9").value;
    if(increment_val >0 && (increment_val < 3 || increment_val >5)){
        sendAlert("Extension Study Increment must be between 3 and 5");

        document.getElementById("class9").selectedIndex = "0";
        return;
    } else {
        // set theClass to 'HE-OT'
        //document.getElementById("class9")
    }
    

    if(calcButton==2){
        // determine the active button
        calcButton = button_select;
    } else {
        button_select = button;
    }
    
    // console.log("change " + calcButton);
    
    // call reverse ATAR function
    if(calcButton==1){
        
        //but0.className = "btn btn-primary";
        //but0.style.cssText = "";
        
        //but1.className = "btn active";
        //but1.style.cssText = "color: white;background-color:darkred";  
        
        //goalRow.style.display = "block";
    
        alerts_on = true;
        getATAR2(form, data_load, row);
    }
	else if (calcButton===0) {

	    
        //but1.className = "btn btn-primary";
        //but1.style.cssText = "";
        
        //but0.className = "btn active";
        //but0.style.cssText = "color: white;background-color:darkred";  
        
        //goalRow.style.display = "none";
        
	    alerts_on = true;
	    
	    console.log("check for dupes");
	    // check for duplicates
	    subjectControl(form,  row, 1);
	    
        console.log("call getAgg2");
	    getAgg2(form, data);
	}
	//alerts_on = false;
	//getAgg2(form, data);

});

}

// Only sends alerts if they are switched on by sending a value of 1 to alerts_on
// Useful to reduce code needed for checking if alerts are on
function sendAlert(string) {
	if(alerts_on === true) {
		alert(string);
	}
}

// disable the lock on the reverse ATAR screen when a Raw score is entered
function lock(row) {
    console.log("unlocking" + row);
        //    rawScore = document.getElementById("raw" + i);
    document.getElementById("lock" + row).disabled = false;
}

function check_lock(row) {
    var val_entered = document.getElementById("raw" + row).value ;
    console.log("checking" + val_entered);
    if (!val_entered) {
        console.log("null value");
        document.getElementById("lock" + row).checked = false ;
        document.getElementById("lock" + row).disabled = true ;
        
    }
}

// check for changes when made to a subject in the reverse atar calculator
function subjectControl(form,  row, button=0) {
    var countDupes = 0;
    var i, theClass;
    

    alerts_on = true;

        
    // variables to account for duplicate subjects
    var selSubject = document.getElementById('class' + row);
    
    //console.log(selSubject.value);
    
    if(selSubject !== null){
        
    // check for duplicates here
    // check if the same subject already exists in the array
    // throw an error if it does
    for (i = 1; i < MAX_CLASSES + 1; i += 1) {
        //console.log("row" + sortArray[i][0]);
        theClass = document.getElementById('class' + i).value;
        console.log("row" + theClass);
        
        if(theClass == selSubject.value && row > 0 && theClass !== '') {
            countDupes++ ;
            if(countDupes>1) {
                sendAlert("That subject has already been selected");
                console.log("That subject has already been selected");

                document.getElementById("class" + row).selectedIndex = "0";
                return;
                }
            }
        }
        
        // enable the locked cell
        if(button===0){
            lock(row);
        }
        
    }
}

function reverseCheck(classCount, agg_score, sumScaled, locked, adjSumScaled_1, adjSumScaled_2, lowestScaledScore1, lowestScaledScore2, engAdjust) {
        // adjusted sumScaled
    //var adjSumScaled_1, adjSumScaled_2;
    var a,b,c, reverseScale;
    
    if (classCount == 5) {
        adjSumScaled_1 = (sumScaled - (lowestScaledScore1 * 0.9));
    } else if (classCount >= 6) {
        adjSumScaled_1 = (sumScaled - (lowestScaledScore1 * 0.9));
        if (locked >= 2) {
            adjSumScaled_2 = (sumScaled - (lowestScaledScore1 * 0.9) - (lowestScaledScore2 * 0.9));
        }
    } 
    
    
    // CHECK :: do we need to use the top english score??
    
    console.log('agg_score:' + agg_score + ' sumScaled:'  + sumScaled + 'lowest score 1 ' + lowestScaledScore1 + ' lowest score 2 ' + lowestScaledScore2 + ' classCount: ' + classCount +  ' locked:' + locked + ' adjSumScaled_2:' + adjSumScaled_2 );
    
    // apply scenarios to determine best course of events
    if(classCount == 5) {
        a = (agg_score - adjSumScaled_1)/(classCount - locked);
        b = (agg_score - sumScaled)/(classCount - 1 - locked + 0.1);
    } else if (classCount >= 6 && engAdjust === false) {
        a = (agg_score - adjSumScaled_2)/(6 - locked);
        b = (agg_score - adjSumScaled_1)/(6 - 1 - locked + 0.1);
        c = (agg_score - sumScaled)/(6 - 2 - locked + 0.2);
        
    } else if (classCount >= 6 && engAdjust === true) {
        a = (agg_score - adjSumScaled_2)/(6 - locked);
        b = (agg_score - adjSumScaled_1)/(5.1 - locked);
        c = (agg_score - sumScaled)/(4.2 - locked);
    }
    
    //console.log((agg_score - sumScaled - (lowestScaledScore1 * 0.9)))
    console.log(adjSumScaled_1);
    console.log(adjSumScaled_2);

    console.log("A:" + a + " B:" + b + " C:" + c);
    
    // decide which scenario to apply
    
    if(classCount <= 4){
        reverseScale = (agg_score - sumScaled)/(classCount - locked);
    } else if (classCount == 5 && locked >=2) {
        reverseScale = Math.min(a,b);
    } else if (classCount == 5 && locked === 0) {
        // 26/08/2019 : b
        reverseScale = b;
    } else if (classCount == 5 && locked === 1) {
        // 26/08/2019 : b
        reverseScale = Math.min(a,b);
    }   else if (classCount >= 6 && locked ===0) {
        reverseScale = c; 
    }   else if (classCount >= 6 && locked ===1 && engAdjust === false) {   
        reverseScale = Math.min(b,c);
    }
          
        else if (classCount >= 6 && locked >= 2 && locked <=4 && engAdjust === false) {   
        reverseScale = Math.min(a,b,c);
    }   
        else if (classCount >= 6 && locked == 5 && engAdjust === false) {   
        reverseScale = Math.min(a,b);
    }   
    
        // english is locked
        else if (classCount >= 6 && locked ===1 && engAdjust === true) {   
        reverseScale = c;
    }   
        else if (classCount >= 6 && locked ===2 && engAdjust === true) {   
            // 26/08/2019 : b
        reverseScale = Math.min(b,c);
    } 
        else if (classCount >= 6 && locked >= 3 && locked <=4 && engAdjust === true) {   
        reverseScale = Math.min(a, b);
    }   
            else if (classCount >= 6 && locked == 5 && engAdjust === true) {   
        reverseScale = Math.min(b,c);
    }
        
    
    reverseScale = parseFloat(reverseScale).toFixed(2);
    
    return reverseScale;
}

function getATAR2(form, data, row) {
    var i, j; 
    var theClass, classLocked, theScore, classScaled;

    //var hsclasses = data.hsclasses;
    var hsclasses = data['hsclasses'][0];
    var scaled_agg = data['scaled_agg'];
    console.log(scaled_agg.min_aggregate);
    // exit ;

    var sortArray = [];
    // keep a count of locked cells
    var locked = 0;
    // keep a running sum of locked cell scaled values
    var sumScaled = 0;
    // store the locked cell values in array
    var lowestScaled = [];
    // store the adjusted scaled score based on aggregarte and number of subjects
    var reverseScale;
    
    // get goal ATAR
    var atar_goal = document.getElementById("atar_goal").value;
    
    // get and set the increment values
    var increment_val, inc_flag=false, inc_array;
    
    // get Aggregate Score
    var agg_score = getAggregateScore(atar_goal, scaled_agg);
    var full_agg_score = agg_score;
    
    console.log("agg_score"+agg_score);

    // adjust the Aggregate Score to exclude any increment values
    //if(increment_val>=3){
    //    console.log("increment val" + increment_val + " " + agg_score);
    //    agg_score -= parseFloat(increment_val);
    //    console.log("increment val" + increment_val + " " + agg_score);
    //} else { console.log("no increment val") ; }    

    if(document.getElementById('lock9').checked === true) {
        increment_val =  document.getElementById("raw9").value;
        //agg_score -= parseFloat(increment_val);
        if(increment_val >= 3 && increment_val <= 5){
            inc_flag = true;
        }
    }
    
    console.log("agg_score"+agg_score);
    
// collect some information about the populated cells

    // get number of subjects listed and locked
    for (i = 1; i < MAX_CLASSES + 1; i += 1) {
        theClass = document.getElementById('class' + i).value;
        classLocked = document.getElementById('lock' + i).checked;
        
        //classScaled = document.getElementById('class' + i + 'result').value;
        theScore = document.getElementById("raw" + i).value;
        
        //console.log("theClass" + theClass);
        if(i==9){
            if(classLocked===true) {
                theClass = 'HE-OT';
            } else {
                theClass = '';
                theScore = '';
            }
        }
        
        // recalculate the scaled score for locked cells only
        if(classLocked === true && i < 9) {
            classScaled = setScaling(hsclasses, theClass, theScore, i);
            //document.getElementById('class' + i + 'result').value = classScaled;
            locked += 1;
            sumScaled += parseFloat(classScaled);
            lowestScaled.push([parseFloat(classScaled), theClass]);
        } /* else if(classLocked===true && i==9) {
            console.log("row 9");
            locked += 1;
            sumScaled += (theScore) * 10;
            classScaled = theScore * 10;
            lowestScaled.push([parseFloat(classScaled), theClass]); 
        } */ else {
            console.log("not locked");
            classScaled = 0;
        }
        
        // REF ::
        // push into array : i (row number), scaled score, adjusted scaled score, class, used as text, aggregrate contribution, a sort order column, raw score (7), whether it is a locked value (8)
        if(theClass !== '') {
            if(theClass != 'HE-OT') {
            sortArray.push([i,classScaled,classScaled,theClass,"used",0,0,theScore,classLocked]);
            }
        } else {
            // clean up all fields in case
            document.getElementById('raw' + i).value = '';
            document.getElementById('class' + i + 'result').value = '';
            document.getElementById("used_as" + i + "result").value = '';
            document.getElementById("agg_contribution" + i + "result").value = '';
            
            if(i<9){
                document.getElementById("lock" + i).disabled = true;
            }
                //document.getElementById("raw" + i).value = '';
                //document.getElementById("used_as" + i + "result").value = '';
                //document.getElementById("agg_contribution" + i + "result").value = '';
        }
    }
    

    // sort the array to get the lowest value
    lowestScaled.sort();
    
    // 
    // now check for extension increment and put it in last position
    //if(increment_val >= 3 && increment_val <= 5) {
    //    console.log("row 9");
        //locked += 1;
        //sumScaled += (theScore) * 10;
        //classScaled = theScore * 10;
        //lowestScaled.push([parseFloat(classScaled), theClass]); 
    //}
    
    // adjust the position if neccessary
    if(inc_flag===true) {
        console.log("extension increment in place");
    }
    
    console.log('sortArray');
    console.log(sortArray);

    console.log("lowest scaled");
    console.log(lowestScaled);
    
    
    //console.log("min scale:" + lowestScaled[0][1]);
    
    var lowestScaledScore1 = 0, lowestScaledScore2 = 0,engAdjust=false;

    // if the lowest scaled is English; ignore it and go for the next one
    if (locked > 0) {
        for (i = 0; i < lowestScaled.length; i += 1) {
            if((lowestScaled[i][1] == 'EN' || lowestScaled[i][1] == "EF" || lowestScaled[i][1] == "EG" || lowestScaled[i][1] == "LI") && engAdjust === false) {
                 engAdjust=true;
            } else if (lowestScaledScore1 === 0) {
                lowestScaledScore1 = lowestScaled[i][0];
            } else if (lowestScaledScore1 > 0 && lowestScaledScore2 ===0 ) {
                lowestScaledScore2 = lowestScaled[i][0];
            } 
        }
    }
    
        // variables to store results of scenarios
    // a = full (e.g. 4), b = 1 x 0.1 , c = 2 x 0.2
    var a, b, c;
    var classCount = sortArray.length;
    
    console.log("class count" + classCount);
    
    // adjust for extension increment
    var agg_score_bkp = agg_score;
    if(inc_flag===true){
        agg_score = agg_score - increment_val;
        //lowestScaledScore1 = increment_value
    }
    

    
    // adjusted sumScaled
    var adjSumScaled_1, adjSumScaled_2;
    if (classCount == 5) {
        adjSumScaled_1 = (sumScaled - (lowestScaledScore1 * 0.9));
    } else if (classCount >= 6) {
        adjSumScaled_1 = (sumScaled - (lowestScaledScore1 * 0.9));
        if (locked >= 2) {
            adjSumScaled_2 = (sumScaled - (lowestScaledScore1 * 0.9) - (lowestScaledScore2 * 0.9));
        }
    } 
    
    
    // CHECK :: do we need to use the top english score??
    
    console.log('agg_score:' + agg_score + ' sumScaled:'  + sumScaled + 'lowest score 1 ' + lowestScaledScore1 + ' lowest score 2 ' + lowestScaledScore2 + ' classCount: ' + classCount +  ' locked:' + locked + ' adjSumScaled_2:' + adjSumScaled_2 );
    
    // apply scenarios to determine best course of events
    if(classCount == 5) {
        a = (agg_score - adjSumScaled_1)/(classCount - locked);
        b = (agg_score - sumScaled)/(classCount - 1 - locked + 0.1);
    } else if (classCount >= 6 && engAdjust === false) {
        a = (agg_score - adjSumScaled_2)/(6 - locked);
        b = (agg_score - adjSumScaled_1)/(6 - 1 - locked + 0.1);
        c = (agg_score - sumScaled)/(6 - 2 - locked + 0.2);
        
    } else if (classCount >= 6 && engAdjust === true) {
        a = (agg_score - adjSumScaled_2)/(6 - locked);
        b = (agg_score - adjSumScaled_1)/(5.1 - locked);
        c = (agg_score - sumScaled)/(4.2 - locked);
    }
    
    //console.log((agg_score - sumScaled - (lowestScaledScore1 * 0.9)))
    console.log(adjSumScaled_1);
    console.log(adjSumScaled_2);

    console.log("A:" + a + " B:" + b + " C:" + c);
    
    // decide which scenario to apply
    
    if(classCount <= 4){
        reverseScale = (agg_score - sumScaled)/(classCount - locked);
    } else if (classCount == 5 && locked >=2) {
        reverseScale = Math.min(a,b);
    } else if (classCount == 5 && locked === 0) {
        // 26/08/2019 : b
        reverseScale = b;
    } else if (classCount == 5 && locked === 1) {
        // 26/08/2019 : b
        reverseScale = Math.min(a,b);
    }   else if (classCount >= 6 && locked ===0) {
        reverseScale = c; 
    }   else if (classCount >= 6 && locked ===1 && engAdjust === false) {   
        reverseScale = Math.min(b,c);
    }
          
        else if (classCount >= 6 && locked >= 2 && locked <=4 && engAdjust === false) {   
        reverseScale = Math.min(a,b,c);
    }   
        else if (classCount >= 6 && locked == 5 && engAdjust === false) {   
        reverseScale = Math.min(a,b);
    }   
    
        // english is locked
        else if (classCount >= 6 && locked ===1 && engAdjust === true) {   
        reverseScale = c;
    }   
        else if (classCount >= 6 && locked ===2 && engAdjust === true) {   
            // 26/08/2019 : b
        reverseScale = Math.min(b,c);
    } 
        else if (classCount >= 6 && locked >= 3 && locked <=4 && engAdjust === true) {   
        reverseScale = Math.min(a, b);
    }   
            else if (classCount >= 6 && locked == 5 && engAdjust === true) {   
        reverseScale = Math.min(b,c);
    }
        
    
    reverseScale = parseFloat(reverseScale).toFixed(2);
    
        // determine if we adjust the classCount for the extension increment
    
    // send to a function and determine if 5 with study increment or 6 without is better.
    
    // reverseScale = function_reverse(agg_score, classCount, locked, sumScaled, lowestScaledScore1, lowestScaledScore2)
    
    var class6reverse, class5reverse, class5reverseFlag = false;
    if(classCount>=6 && inc_flag===true){
        class5reverse = reverseCheck(5, agg_score, sumScaled, locked, adjSumScaled_1, adjSumScaled_2, lowestScaledScore1, lowestScaledScore2, engAdjust);
        class6reverse = reverseCheck(6, agg_score_bkp, sumScaled, locked, adjSumScaled_1, adjSumScaled_2, lowestScaledScore1, lowestScaledScore2, engAdjust);
        
        console.log("class6reverse" + class6reverse + " :: class5reverse" + class5reverse);
        
        if(class5reverse < class6reverse) { 
            reverseScale = class5reverse; 
            class5reverseFlag = true;
        } else {
                reverseScale = class6reverse;
            }
        
    }
    // reverseCheck(classCount, agg_score, sumScaled, locked, adjSumScaled_1, adjSumScaled_2, lowestScaledScore1, lowestScaledScore2, engAdjust)
    
    console.log("lowest value" + reverseScale);

    
    
    // update the array based on a proportioned aggregate score 
    // CHECK:: is this required here???
    //reverseScale = (agg_score-sumScaled)/(sortArray.length - locked);
    
    for (i = 0; i < sortArray.length; i += 1) {
        if(sortArray[i][8] === false) {
            sortArray[i][1] = reverseScale;
            sortArray[i][2] = reverseScale;
        }
        
    }
    
    console.log('sortArray2');
    console.log(sortArray);
    
    
    /////////////////////
    // SORT THE SUBJECTS
    //////////////////////

    sortArray.sort(function(a,b) {
        return b[1]-a[1];
    });
    
    console.log("post sort...");
    console.log(sortArray);
    
   
    
    var outputArray = sortSubject(sortArray);
    
    // sort again
    outputArray.sort(function(a,b) {
        return b[6]-a[6];
    });
    
    
    // adjust when there are more than 6 subjects
    if(classCount>6){
        //console.log("test 6 : " + (outputArray[classCount][1]));
    }
    
    console.log("post outputArray...");
    console.log(outputArray);
    
    
    
    // Go through the sorted list and determine if they are:
    // Top 4 (with 1 English subject area)
    // 5+6
    // Outside
    var top4 = 0;
    var spot56 = 0;
    
    // is scaledAgg a running total???
    //var scaledAgg = 0.00;
    
    console.log("new...");
    console.log(outputArray);
    
   

    
    if(outputArray.length>0){
        for(j = 0; j < outputArray.length; j += 1){
            if (j===0){
                outputArray[j][5] = outputArray[j][2]; 
            //scaledAgg = outputArray[j][2] 
            }
            
            
            
            // 20 to 10
            //if (top4 <= 4 && outputArray[j][2] > 10 ){
            if (top4 <= 4 ){    
                outputArray[j][4] = 'Top 4';
                top4 += 1;
            } else { outputArray[j][4] = '5 and 6';
                spot56 += 1;
            }
            if (top4 > 4 && j<6 ) {
                if (top4 > 4 && spot56 <= 2) {
                    outputArray[j][4] = '5 and 6';
                    spot56 += 1;
                } else {outputArray[j][4] = 'Top 4';
                top4 += 1;}
                if (spot56 >0) { // && outputArray[j][2] > 20) {
                    //console.log("value causing problems");

                    // DIVIDE THE STANDARD SCORE BY 10%
                    //outputArray[j][2] = parseFloat(classScore*0.1).toFixed(1);
                    //outputArray[j][2] = outputArray[7] ; //parseFloat(outputArray[7]).toFixed(2);
                    
                }
            }
            if (j >= 6) {
                outputArray[j][4] = 'Outside';
                outputArray[j][2] = 0;
            }
            
            // check for NaN errors
            if (isNaN(outputArray[j][2]) === true) {
                outputArray[j][2] = parseFloat(outputArray[7]).toFixed(1);
            }
            
            //scaledAgg += parseFloat(outputArray[j][2]);
            //console.log("scaled agg:"+scaledAgg);
            //outputArray[j][5] = parseFloat(scaledAgg);
        }

        console.log("top4:"+top4+" 5and 6:"+spot56 );
    }
    
    // insert the extension increment here only if class5reverse was better
    if(inc_flag === true && class5reverseFlag === true) {
        outputArray.push([9,increment_val,increment_val*10,'HE-OT','5 and 6',0,0,increment_val,true]);
        outputArray[5][4] = 'Outside';
    } else if (inc_flag === true && class5reverseFlag === false) {
        outputArray.push([9,increment_val,increment_val*10,'HE-OT','Outside',0,0,increment_val,true]);
    }
    
    
    console.log("final array...");
    console.log(outputArray);
    

    
    // ouput the data to the form
    // enter in all the data to the respective fields on the html form
    // REF :: outputArray : i (row number), scaled score, adjusted scaled score, class, used as text, aggregrate contribution, a sort order column, raw score (7), whether it is a locked value (8)
    // CHECK :: CLEAR OUT ALL THE "SELECT SUBJECT" CELLS AS WELL; you should be able to do this by changing the for condition to max_classes
    
        if(outputArray.length>0){

        for(j = 0; j < outputArray.length; j += 1){

            // calculate the "reverse raw" score and populate the field
            if(outputArray[j][8] === false) {
                outputArray[j][7] = reverseScaling(hsclasses, outputArray[j][3], outputArray[j][1], outputArray[j][0] );
                document.getElementById("raw" + outputArray[j][0]).value = parseFloat(outputArray[j][7]).toFixed(0);
            }
            
            if(outputArray[j][1] > 50 && outputArray[j][8] === false){
			    document.getElementById("raw" + outputArray[j][0]).value = 50;
			    document.getElementById("raw" + outputArray[j][0]).style.color = "red";
			} else {
			    document.getElementById("raw" + outputArray[j][0]).style.color = "black";
			}
			
            // this will display the adjusted scaled score
			document.getElementById("class" + outputArray[j][0] + "result").value = parseFloat(outputArray[j][1]).toFixed(1);
            // unlock if locked
            lock(outputArray[j][0]);
			
			document.getElementById("used_as" + outputArray[j][0] + "result").value = outputArray[j][4];
			
			console.log("aggregate contribution");
			// aggregate contribution
			if(outputArray[j][4] == '5 and 6') {
			    outputArray[j][5] = parseFloat((outputArray[j][2]/agg_score_bkp)*10).toFixed(2);
			} else if (outputArray[j][4] == 'Top 4') {
			    outputArray[j][5] = parseFloat((outputArray[j][2]/agg_score_bkp)*100).toFixed(2);
			} else {
			    outputArray[j][5] = 0;
			}
			
			console.log(outputArray[j][5] + "row" + i + outputArray[j][0]); 
			document.getElementById("agg_contribution" + outputArray[j][0] + "result").value = outputArray[j][5];
        }
            
    }
    

    
    return;
    
    
}



function getATAR(form, data, row) {
    var i, classCount = 0, theClass, aggDenom, classScore;
    var theScore;
    var rawScore;
    var scaled = Array.apply(null, [MAX_CLASSES]).map(Number.prototype.valueOf, 0);	// Scaled score
	var scaled2 = Array.apply(null, [MAX_CLASSES]).map(Number.prototype.valueOf, 0);// Copy of scaled scores; they are not touched by sorting
    //var hsclasses = data.hsclasses;
    var hscclasses = data['hsclasses'][0];
    var scaled_agg = data['scaled_agg'];
    var completeInfo = [0];
    var sortArray = [];
    var classLocked, lockedCount1 = 0, lockedCount2 = 0,classScaled, subScaled1 = 0, subScaled2 = 0;
    
    
    
    // variables to account for duplicate subjects
    var selSubject = '';
    var countDupes = 0;
    
    // set Raw Score to disabled = TRUE
    //for (i = 1; i < MAX_CLASSES + 1; i += 1) {
    //    rawScore = document.getElementById("raw" + i);
    //    rawScore.disabled = true;
    //}lock
    
    // get goal ATAR
    var atar_goal = document.getElementById("atar_goal").value;
    //console.log("atar goal:" + atar_goal);

    //console.log(data);
    // get Aggregate Score
    var agg_score = getAggregateScore(atar_goal, scaled_agg)
    
    //console.log("aggregate score:" +agg_score );
    
    // get select row subject
    if(row > 0) {
        selSubject = document.getElementById('class' + row).value;
        console.log("class selected AGAIN:" + selSubject);
    }
    
    // get number of subjects listed and locked
    for (i = 1; i < MAX_CLASSES + 1; i += 1) {
        
        theClass = document.getElementById('class' + i).value;//  form['class' + i];
        classLocked = document.getElementById('lock' + i).checked;
        classScaled = document.getElementById('class' + i + 'result').value;
        theScore = document.getElementById("raw" + i).value;

        console.log("class selected " + theClass + " locked " + classScaled + "lock enabled " +classLocked );
        
        // recalculate the scaled score for locked cells only
        if(classLocked === true) {
            console.log("locked");
            classScaled = setScaling(hsclasses, theClass, theScore, i);
            document.getElementById('class' + i + 'result').value = classScaled;
        
        } else {
            console.log("not locked");
        }
        
        if (theClass !== "") {
            classCount += 1;
        }
        if (classLocked === true && isNaN(classScaled) === false) {
            if(classScaled > 10) {
                lockedCount1 += 1;
                subScaled1 += parseInt(classScaled);
            } else if (classScaled < 10) {
                lockedCount2 += 1;
                subScaled2 += parseInt(classScaled);
            }
        }
    }
    
    
    
    

    
    // we now need to sort the list of subjects and try and determine which ones are in the top 4 etc.
    
    // work out the percentages to be applied to with regards to locking
    
    console.log("total classes:" + classCount + "subScale1:" + subScaled1 + "subScale2:" + subScaled2 + "locked1:"+ lockedCount1);
    
    if(classCount === 0) {
        return;
    } else if(classCount <= 4) {
        aggDenom = classCount - lockedCount1;
    } else if(classCount == 5) {
        aggDenom = 4.1 - (lockedCount1) - (lockedCount2/10);
    } else if(classCount >= 6) {
        aggDenom = 4.2 - (lockedCount1) - (lockedCount2/10);
    }
    
    // divide ATAR by scaling (4 = 4, 5 = 4.1, 6 = 4.2)
    //classScore = (agg_score- subScaled1 - subScaled2)/aggDenom;
    
    // adjustments come later after sorting
    classScore = (agg_score- subScaled1 - subScaled2)/(classCount - lockedCount1- lockedCount2);
    
    console.log("classScore " + classScore + "aggscore " + agg_score + "agg denom" + aggDenom);
    
    // populate cells - only populate with at least 4 subjects
    for (i = 1; i < MAX_CLASSES + 1; i += 1) {
        theClass = document.getElementById('class' + i).value;//  form['class' + i];
        theScore = document.getElementById('raw' + i).value;//  form['class' + i];
        classLocked = document.getElementById('lock' + i).checked;
        classScaled = document.getElementById('class' + i + 'result').value;

        //console.log("reverse scaling!!!" + theClass + "score :" + theScore);

        if ((theClass !== "" || theScore !== "") || theClass == "VV-O") {
			// Class has a scaled score and class name
            
            //if(classLocked === true && isNaN(classScaled)===false) {
            if(classLocked === true) {
                scaled[parseInt(i-1)] = setScaling(hsclasses, theClass, theScore, i);
            } else {
                scaled[parseInt(i-1)] = classScore; //reverseScaling(hsclasses, theClass, classScore, i )
            }

			scaled2[i - 1] = scaled[i - 1];
            completeInfo.push(i);

            // push into array : i (row number), scaled score, adjusted scaled score, class, used as text, aggregrate contribution, a sort order column, raw score (7), whether it is a locked value (8)
            sortArray.push([i,scaled[i - 1],scaled[i - 1],theClass,"used",0,0,classScaled,classLocked]);

        }
    }
    
    console.log('sortArray');
    console.log(sortArray);
    
    
    // check for duplicates here
    // check if the same subject already exists in the array
    // throw an error if it does
    for (i = 0; i < sortArray.length; i += 1) {
        console.log("row" + sortArray[i][0]);
        theClass = sortArray[i][3];
        if(theClass == selSubject && row > 0) {
            countDupes++ ;
            if(countDupes>1) {
                sendAlert("That subject has already been selected");
                console.log("That subject has already been selected");

                document.getElementById("class" + sortArray[i][0]).selectedIndex = "0";
                return;
            }
        }
    }

    // now sort it
    sortArray.sort(function(a,b) {
    return b[1]-a[1]
    });
    
    console.log("post sort...");
    console.log(sortArray);
    
    // Running tallies of max class limited subjects, and 
    var engCount = 0;
    var mathCount = 0;
    var musicCount = 0;
    var industryCount = 0;
    var historyCount = 0;
    var ausCount = 0;
    var csitCount = 0;
    var languageCount = 0;
	
	// Need to do special stuff if a VCE VET - Other class is found
	var vvoFound = false;
    
    // Top scores in limited class types
    var english = [];
    var math = [];
    var music = [];
    var industry = [];
    var history = [];
    var aus = [];
    var csit = [];
    var language = [];
    
    var max = [0, 0];
	var max_class = [0, 0];
    var thisClass;
    var temp = [0, 0];
    var j;
    
    var outputArray = [];
    
    // console.log("sortArray length:"+sortArray.length);
    
    for (i = 0; i < sortArray.length; i += 1) {
        // get class code
        theClass = sortArray[i][3];
                
                
        // Check if an English Subject
        if (theClass == "EN" || theClass == "EF" || theClass == "EG" || theClass == "LI") {
            engCount += 1;
            sortArray[i][6] = sortArray[i][2];
            if(engCount==1) {sortArray[i][6] = 100; }
            if(engCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][2]*0.1).toFixed(2);  }
            
            english.push(sortArray[i]);
            outputArray.push(sortArray[i]);
            console.log("english:"+english);
            
            // no need to sort, we do this earlier and it flows through here
            
         } // Mathematics
         else if (theClass == "NF" || theClass == "NJ" || theClass == "NS") {
            mathCount += 1;
            if(mathCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][2]*0.1).toFixed(2);}
                sortArray[i][6] = sortArray[i][2];  
            math.push(sortArray[i]);
           outputArray.push(sortArray[i]);
            console.log("math:"+math);
            
         } // Language
         else if (theClass == 'AR' || theClass == 'AM' || theClass == 'AU' || theClass == 'BE' || theClass == 'LO50' || theClass == 'LO53' || theClass == 'CN' || theClass == 'LO57' || theClass == 'CK' || theClass == 'CL' || theClass == 'AG' || theClass == 'LO51' || theClass == 'CR' || theClass == 'DU' || theClass == 'FP' || theClass == 'FR' || theClass == 'GN' || theClass == 'MG' || theClass == 'HB' || theClass == 'HI' || theClass == 'HU' || theClass == 'AI' || theClass == 'IN' || theClass == 'IX' || theClass == 'IL' || theClass == 'JA' || theClass == 'JS' || theClass == 'LO55' || theClass == 'KH' || theClass == 'KO' || theClass == 'KS' || theClass == 'LA' || theClass == 'MA' || theClass == 'ML' || theClass == 'PN' || theClass == 'PO' || theClass == 'PG' || theClass == 'LO49' || theClass == 'RO' || theClass == 'RU' || theClass == 'SE' || theClass == 'SI' || theClass == 'SP' || theClass == 'SW' || theClass == 'TA' || theClass == 'TU' || theClass == 'UK' || theClass == 'LO54' || theClass == 'LO31' || theClass == 'LO52') {
            languageCount += 1;
            if(languageCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][2]*0.1).toFixed(2);}
                sortArray[i][6] = sortArray[i][2]; 
            language.push([sortArray[i]]);
            outputArray.push(sortArray[i]);
            console.log("language:"+language);
         } // Music
         else if (theClass == "MD" || theClass == "MC04" || theClass == "MC05") {
            musicCount += 1;
            if(musicCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][1]*0.1).toFixed(2);}
                sortArray[i][6] = sortArray[i][2]; 
            music.push(sortArray[i]);
            outputArray.push(sortArray[i]);
            console.log("music:"+music);
            
         } // History
         else if (theClass == 'HI17' || theClass == 'HA' || theClass == 'HR') {
             historyCount += 1;
            if(historyCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][1]*0.1).toFixed(2);}
            sortArray[i][6] = sortArray[i][2]; 
             history.push(sortArray[i]);
             outputArray.push(sortArray[i]);
            console.log("history:"+history);
         } // CSIT
         else if (theClass == "AL03" || theClass == "IT02" || theClass == "IT03" || theClass == "IN60") {
            csitCount += 1;
            if(csitCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][1]*0.1).toFixed(2); }
            sortArray[i][6] = sortArray[i][2]; 
            csit.push(sortArray[i]);
            outputArray.push(sortArray[i]);
            console.log("csit:"+csit);
         } // VV-O
         else if (theClass == "VV-O") {
            vvoFound = true;
		} else {
            // Another subject was found ??
            outputArray.push(sortArray[i]);
            sortArray[i][6] = sortArray[i][2];
        }
    }
    
    // sort it 
    outputArray.sort(function(a,b) {
        return b[6]-a[6];
    });

    // our sort array

    // TO DO (in order):
    // - sort outputArray DONE  
    // - "another subject" e.g. accounting DONE
    // - adjust 5 and 6 scaled scores if required
    // - adjust 7 and 8 scaled scored if required
    // - decimal places
    // - aggregate contribution
    

    // Go through the sorted list and determine if they are:
    // Top 4 (with 1 English subject area)
    // 5+6
    // Outside
    var top4 = 0;
    var spot56 = 0;
    
    // is scaledAgg a running total???
    var scaledAgg = 0.00;
    
    console.log("new...");
    console.log(outputArray);
    
    if(outputArray.length>0){
        for(j = 0; j < outputArray.length; j += 1){
            if (j===0){
                outputArray[j][5] = outputArray[j][2]; 
            //scaledAgg = outputArray[j][2] 
            }
            
            // 20 to 10
            //if (top4 <= 4 && outputArray[j][2] > 10 ){
            if (top4 <= 4 ){    
                outputArray[j][4] = 'Top 4';
                top4 += 1;
            } else { outputArray[j][4] = '5 and 6';
                spot56 += 1;
            }
            if (top4 > 4 && j<6 ) {
                if (top4 > 4 && spot56 <= 2) {
                    outputArray[j][4] = '5 and 6';
                    spot56 += 1;
                } else {outputArray[j][4] = 'Top 4';
                top4 += 1;}
                if (spot56 >0) { // && outputArray[j][2] > 20) {
                    console.log("value causing problems");

                    // DIVIDE THE STANDARD SCORE BY 10%
                    outputArray[j][2] = parseFloat(classScore*0.1).toFixed(1);
                    //outputArray[j][2] = outputArray[7] ; //parseFloat(outputArray[7]).toFixed(2);
                }
            }
            if (j >= 6) {
                outputArray[j][4] = 'Outside';
                outputArray[j][2] = 0;
            }
            
            // check for NaN errors
            if (isNaN(outputArray[j][2]) === true) {
                outputArray[j][2] = parseFloat(outputArray[7]).toFixed(1);
            }
            
            scaledAgg += parseFloat(outputArray[j][2]);
            //console.log("scaled agg:"+scaledAgg);
            //outputArray[j][5] = parseFloat(scaledAgg);
        }

        console.log("top4:"+top4+" 5and 6:"+spot56 + " scaledAgg:" + scaledAgg);
    }

    // work out the percentages to be applied to with regards to locking
    /*
    console.log("total classes:" + classCount + "subScale1:" + subScaled1 + "subScale2:" + subScaled2 + "locked1:"+ lockedCount1);
    
    if(classCount === 0) {
        return;
    } else if(classCount <= 4) {
        aggDenom = classCount - lockedCount1;
    } else if(classCount == 5) {
        aggDenom = 4.1 - (lockedCount1) - (lockedCount2/10);
    } else if(classCount >= 6) {
        aggDenom = 4.2 - (lockedCount1) - (lockedCount2/10);
    }
    
    // divide ATAR by scaling (4 = 4, 5 = 4.1, 6 = 4.2)
    classScore = (agg_score- subScaled1 - subScaled2)/aggDenom;
    */
    
    
    // update the outputArray[j][2] "adjusted scaled score"
    // TO DO: We will also do adjustments here based on top 4/5 and 6 so that we can equal the aggregrate score
    // scenarios:
    // 5 subjects - locked / unlocked
    // 6+ subjects - locked / unlocked
    if(outputArray.length>0){
        for(j = 0; j < outputArray.length; j += 1){
            console.log("going in scaled score: "+outputArray[j][0]+" val: "+outputArray[j][2]);
            classLocked = outputArray[j][8];
            classScaled = outputArray[j][7];
            
            if(outputArray[j][4] == '5 and 6') {
                if(classLocked === true && isNaN(classScaled)===false) {
                    // do nothing
                } else {
                //outputArray[j][2] = parseFloat(classScore).toFixed(1) ;
                    
                }
            } else if (outputArray[j][4] == 'Top 4') {
                if(classLocked === true && isNaN(classScaled)===false) {
                    // do nothing
                } else {
                outputArray[j][2] = parseFloat(classScore).toFixed(1) ;}
            } else { 
                outputArray[j][2] = 0 ;
            }
            
            
            //adjust non-locked Top 4 subjects - 5 subjects
            if(outputArray[j][4] == 'Top 4' && classLocked === false) {
                outputArray[j][2] += agg_score - scaledAgg;
                outputArray[j][1] += agg_score - scaledAgg;
            }
            
            if(isNaN(outputArray[j][2]) === true) {
                outputArray[j][2] = outputArray[j][7];
            }
        }
    }
    

    
    // ***TO DO: AGGREGATE SCORE HAS BEEN CALCULATED ALREADY 
    // Calc aggregate score and atar and update page
    //var aggScore = 0;
    //aggScore = getFinalScore_new(scaledAgg, data.scaled_agg);

    console.log("final agg score:"+ agg_score);

    // get the aggregate contributions as a percentage of outputArray[j][2]
    if(outputArray.length>0){
        for(j = 0; j < outputArray.length; j += 1){
            if(j===0 && outputArray.length == 1){outputArray[j][5] = 100;} else {
            outputArray[j][5] = (parseFloat(outputArray[j][2]/(agg_score/100))).toFixed(2); }
        }
    }
            
    

    // enter in all the data to the respective fields on the html form
    // array: i (row number), scaled score, adjusted scaled score, class, used as text, aggregrate contribution, a sort order column
    // TO DO: CLEAR OUT ALL THE "SELECT SUBJECT" CELLS AS WELL; you should be able to do this by changing the for condition to max_classes
    
        if(outputArray.length>0){

        for(j = 0; j < outputArray.length; j += 1){
			// Replace old data woutputArray.lengthith temp data
			//console.log("scaled score: "+outputArray[j][0]+" val: "+outputArray[j][2])
				
            // this will display the raw scaled score
            // TO DO : if score is locked do nothing
            // else run the reverse scaling function
            // outputArray[j][7] = reverseScaling(hsclasses, theClass, classScore, i )
            if(outputArray[j][8] === false) {
                outputArray[j][7] = reverseScaling(hsclasses, outputArray[j][3], outputArray[j][1], outputArray[j][0] );
                document.getElementById("raw" + outputArray[j][0]).value = outputArray[j][7];
            }
			
            // this will display the adjusted scaled score
			document.getElementById("class" + outputArray[j][0] + "result").value = parseFloat(outputArray[j][1]).toFixed(1);
			
			document.getElementById("used_as" + outputArray[j][0] + "result").value = outputArray[j][4];
			document.getElementById("agg_contribution" + outputArray[j][0] + "result").value = outputArray[j][5];
        }
            
    }
    
    return;
}


// 500 - This function is used on the 'Marks To ATAR' calculation
// taking a raw score it will calculate the scaled score, used_as, aggregate contribution, ATAR and aggregrate score

function getAgg2(form, data) {

    //console.log(data);

    var rawScore;
    var scaled = Array.apply(null, [MAX_CLASSES]).map(Number.prototype.valueOf, 0);	// Scaled score
	var scaled2 = Array.apply(null, [MAX_CLASSES]).map(Number.prototype.valueOf, 0);// Copy of scaled scores; they are not touched by sorting
    //var hsclasses = data.hsclasses;
    var hsclasses = data['hsclasses'][0];
    var scaled_agg = data['scaled_agg'];
    console.log(scaled_agg);
    
    var completeInfo = [0];
    var sortArray = [];
    
    // get and set the increment values
    var increment_val = document.getElementById("raw9").value;
    //document.getElementById("increment_copy").value = increment_val;
    
    //console.log("increment val:"+ increment_val);
    
    // set Raw Score to disabled = false
    //for (i = 1; i < MAX_CLASSES + 1; i += 1) {
    //    rawScore = document.getElementById("raw" + i);
    //    rawScore.disabled = false;
    //}
    
    
    // For all the classes, check if number and class has been selected then change the final score and scaling columns
    var i = 0;
    var theClass;
    var theScore;

    for (i = 1; i < MAX_CLASSES + 1; i += 1) {
        theClass = document.getElementById('class' + i).value;//  form['class' + i];
        theScore = document.getElementById('raw' + i).value;//  form['class' + i];
        
        if(i==9) {
            if (document.getElementById('raw' + i).value > 0) {
            theClass = 'HE-OT';
            theScore = document.getElementById('raw' + i).value;
            } else { theClass = ''; }
        }
        //theClass = form['class' + i].value;
        //theScore = form['raw' + i].value;
        
        console.log(i + ": theclass " + theClass + " theScore " + theScore);

        if (!(theClass === "" || theScore === "") || theClass === "VV-O") {
			// Class has a score and class name
            scaled[parseInt(i - 1)] = setScaling(hsclasses, theClass, theScore, i);
            
			scaled2[i - 1] = scaled[i - 1];
            completeInfo.push(i);

            // push into array : i (row number), scaled score, adjusted scaled score, class, used as text, aggregrate contribution, a sort order column
            sortArray.push([i,scaled[i - 1],scaled[i - 1],theClass,"used",0,0]);

        } else {
			// Clear scaled data to avoid scaling retention
			//document.getElementById("scaling" + i).innerHTML = "<span>+0</span>";
			document.getElementById("class" + i + "result").value = "";
			document.getElementById("used_as" + i + "result").value = "";
			document.getElementById("agg_contribution" + i + "result").value = "";
		}
    }


    // The classes are rearranged in order of score and certain rules below
    // Some classes have limits on max and min and some are only allowed as a 10% subject
    
    // now sort it
    sortArray.sort(function(a,b) {
    return b[1]-a[1]
    });
    
    //console.log("sortArray"+sortArray[1]);
    
    
    // These variables store the "best" score(s) for each category
    //var englishTop;
    //var otherTop3;
    //var fiveAndSix;
    
    // Running tallies of max class limited subjects, and 
    var engCount = 0;
    var mathCount = 0;
    var musicCount = 0;
    var industryCount = 0;
    var historyCount = 0;
    var ausCount = 0;
    var csitCount = 0;
    var languageCount = 0;
	
	// Need to do special stuff if a VCE VET - Other class is found
	var vvoFound = false;
    
    // Top scores in limited class types
    var english = [];
    var math = [];
    var music = [];
    var industry = [];
    var history = [];
    var aus = [];
    var csit = [];
    var language = [];
    
    var max = [0, 0];
	var max_class = [0, 0];
    var thisClass;
    var temp = [0, 0];
    var j;
    
    var outputArray = [];
    
    //console.log("sortArray length:"+sortArray.length);
    
    for (i = 0; i < sortArray.length; i += 1) {
        // get class code
        theClass = sortArray[i][3];
                
                
        // Check if an English Subject
        if (theClass == "EN" || theClass == "EF" || theClass == "EG" || theClass == "LI") {
            engCount += 1;
            sortArray[i][6] = sortArray[i][2];
            if(engCount==1) {sortArray[i][6] = 100; }
            if(engCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][2]*0.1).toFixed(2);  }
            
            english.push(sortArray[i]);
            outputArray.push(sortArray[i]);
            console.log("english:"+english);
            
            // no need to sort, we do this earlier and it flows through here
            
         } // Mathematics
         else if (theClass == "NF" || theClass == "NJ" || theClass == "NS") {
            mathCount += 1;
            if(mathCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][2]*0.1).toFixed(2);}
                sortArray[i][6] = sortArray[i][2];  
            math.push(sortArray[i]);
           outputArray.push(sortArray[i]);
            console.log("math:"+math);
            
         } // Language
         else if (theClass == 'AR' || theClass == 'AM' || theClass == 'AU' || theClass == 'BE' || theClass == 'LO50' || theClass == 'LO53' || theClass == 'CN' || theClass == 'LO57' || theClass == 'CK' || theClass == 'CL' || theClass == 'AG' || theClass == 'LO51' || theClass == 'CR' || theClass == 'DU' || theClass == 'FP' || theClass == 'FR' || theClass == 'GN' || theClass == 'MG' || theClass == 'HB' || theClass == 'HI' || theClass == 'HU' || theClass == 'AI' || theClass == 'IN' || theClass == 'IX' || theClass == 'IL' || theClass == 'JA' || theClass == 'JS' || theClass == 'LO55' || theClass == 'KH' || theClass == 'KO' || theClass == 'KS' || theClass == 'LA' || theClass == 'MA' || theClass == 'ML' || theClass == 'PN' || theClass == 'PO' || theClass == 'PG' || theClass == 'LO49' || theClass == 'RO' || theClass == 'RU' || theClass == 'SE' || theClass == 'SI' || theClass == 'SP' || theClass == 'SW' || theClass == 'TA' || theClass == 'TU' || theClass == 'UK' || theClass == 'LO54' || theClass == 'LO31' || theClass == 'LO52') {
            languageCount += 1;
            if(languageCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][2]*0.1).toFixed(2);}
                sortArray[i][6] = sortArray[i][2]; 
            language.push([sortArray[i]]);
            outputArray.push(sortArray[i]);
            console.log("language:"+language);
         } // Music
         else if (theClass == "MD" || theClass == "MC04" || theClass == "MC05") {
            musicCount += 1;
            if(musicCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][1]*0.1).toFixed(2);}
                sortArray[i][6] = sortArray[i][2]; 
            music.push(sortArray[i]);
            outputArray.push(sortArray[i]);
            console.log("music:"+music);
            
         } // History
         else if (theClass == 'HI17' || theClass == 'HA' || theClass == 'HR') {
             historyCount += 1;
            if(historyCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][1]*0.1).toFixed(2);}
            sortArray[i][6] = sortArray[i][2]; 
             history.push(sortArray[i]);
             outputArray.push(sortArray[i]);
            console.log("history:"+history);
         } // CSIT
         else if (theClass == "AL03" || theClass == "IT02" || theClass == "IT03" || theClass == "IN60") {
            csitCount += 1;
            if(csitCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][1]*0.1).toFixed(2); }
            sortArray[i][6] = sortArray[i][2]; 
            csit.push(sortArray[i]);
            outputArray.push(sortArray[i]);
            console.log("csit:"+csit);
         } // VV-O
         else if (theClass == "VV-O") {
            vvoFound = true;
		} else {
            // Another subject was found ??
            outputArray.push(sortArray[i]);
            sortArray[i][6] = sortArray[i][2];
        }
    }
    

    
    // sort it 
    outputArray.sort(function(a,b) {
        return b[6]-a[6];
    });
    
    // our sort array
    console.log("our outputArray");
    console.log(outputArray);
    

    
    // TO DO (in order):
    // - sort outputArray DONE  
    // - "another subject" e.g. accounting DONE
    // - adjust 5 and 6 scaled scores if required
    // - adjust 7 and 8 scaled scored if required
    // - decimal places
    // - aggregate contribution
    // 
    
    // NOT REQUIRED -> join all the subject arrays back together

    // Go through the sorted list and determine if they are:
    // Top 4 (with 1 English subject area)
    // 5+6
    // Outside
    var top4 = 0;
    var spot56 = 0;
    var scaledAgg = 0.00;
    
    console.log("output array to check:");
    console.log(outputArray);
    
    if(outputArray.length>0){
        for(j = 0; j < outputArray.length; j += 1){
            if (j===0){
                outputArray[j][5] = outputArray[j][2]; 
            //scaledAgg = outputArray[j][2] 
            }
            

            // 20 to 10
            if (top4 <= 4 && outputArray[j][2] > 10 ){
                outputArray[j][4] = 'Top 4';
                top4 += 1;
            } else { outputArray[j][4] = '5 and 6';
                spot56 += 1;
            }
            if (top4 > 4 && j<6 ) {
                if (top4 > 4 && spot56 <= 2) {
                    outputArray[j][4] = '5 and 6';
                    spot56 += 1;
                } else {outputArray[j][4] = 'Top 4';
                top4 += 1;}
                if (spot56 >0) { // && outputArray[j][2] > 20) {
                    console.log("value causing problems");
                    console.log(outputArray[j]);
                    if(outputArray[j][3]!='HE-OT'){
                    outputArray[j][2] = parseFloat(outputArray[j][1]*0.1).toFixed(2);
                    } else {
                        outputArray[j][2] = parseFloat(outputArray[j][1]).toFixed(2);
                    }
                }
            }
            if (j >= 6) {
                outputArray[j][4] = 'Outside';
                outputArray[j][2] = 0;
            }
            
            scaledAgg += parseFloat(outputArray[j][2]);
            console.log("scaled agg:"+scaledAgg);
            outputArray[j][5] = parseFloat(scaledAgg);
        }

        console.log("top4:"+top4+" 5and 6:"+spot56);
    }
    
    // Calc aggregate score and atar and update page
    var aggScore = 0;
    
    // update to include any increment value
    //if(increment_val>=3){
    //    console.log("increment filled")
    //    scaledAgg += parseFloat(increment_val);
    //} else {
    //    console.log("increment FAILED")
    //}
    
    aggScore = getFinalScore_new(scaledAgg, scaled_agg);
    
    console.log("increment val:"+ increment_val);
    console.log("final agg score:"+ aggScore);
    
    // get the aggregate contributions as a percentage of scaled score
    if(outputArray.length>0){
        for(j = 0; j < outputArray.length; j += 1){
            if(j===0 && outputArray.length == 1){outputArray[j][5] = 100;} else {
            outputArray[j][5] = (parseFloat(outputArray[j][2]/(aggScore/100))).toFixed(2); }
        }
    }
            
    
    // enter in all the data to the respective fields on the html form
    // array: i (row number), scaled score, adjusted scaled score, class, used as text, aggregrate contribution, a sort order column
    
    console.log("new...");
    console.log(outputArray);
    
        if(outputArray.length>0){
        for(j = 0; j < outputArray.length; j += 1){
				// Replace old data woutputArray.lengthith temp data
				console.log("class pos: "+outputArray[j][0]+" val: "+outputArray[j][3])

            // this will display the raw scaled score
			document.getElementById("class" + outputArray[j][0] + "result").value = parseFloat(outputArray[j][1]).toFixed(1);
			

            // this will display the adjusted scaled score
			//document.getElementById("class" + outputArray[j][0] + "result").value = outputArray[j][2];
			
			document.getElementById("used_as" + outputArray[j][0] + "result").value = outputArray[j][4];
			document.getElementById("agg_contribution" + outputArray[j][0] + "result").value = outputArray[j][5];
			// if the used_as value is Top4, enable the locked button, otherwise disable

        }
    }
    
    

    

    
    var sortArrayLength = sortArray.length;
    
    // create an array to store the "output"
    outputArray = [];

    // add in english first
    if(english.length > 0){
        console.log("adding english 1");
        outputArray.push(english[0]);
        english = deleteRow(english,1);
        //english.pop(english.length);
        console.log("sortArray out"+sortArray[0][3]);
        console.log("outputArray out"+outputArray[0][3]);
        console.log("english out"+english);   
    
    
        // clean up the sortArray
        for (i = 0; i < sortArrayLength; i += 1) {
            
            if(sortArray[i][3] == outputArray[0][3]){
                console.log("deleted"+sortArray);
                sortArray = deleteRow(sortArray,i+1);
                console.log("deleted"+sortArray);
                sortArrayLength -= 1;
            }
        }
    }
    

    
    // add in second subject (or first if no english)
    sortArrayLength = sortArray.length;
    
    if(sortArrayLength>0){
        var second_subject = sortArray[0][3];
        outputArray.push(sortArray[0]);
        sortArray = deleteRow(sortArray,1);
        console.log("2nd subject deleted"+sortArray);
        sortArrayLength -= 1;
    }
    

    
    // in adding the third subject, we should only have to worry if it is from an English subject area.
    if(sortArrayLength>0){
        var third_subject = sortArray[0][3];
        

        for(j = 0; j < english.length; j += 1) {
            if(english[j][3]==second_subject) {
                english = deleteRow(english,1);
                j-=1;
            } else if(english[j][3]==third_subject) {
                //console.log("parse"+parseInt(sortArray[0][2])*0.10);
                //sortArray[0][2]=parseInt(sortArray[0][2])*0.10;
                // re-sort based on adjusted scaled values
                sortArray.sort(function(a,b) {
                    return b[2]-a[2]
                });
            } 
        }
         console.log("resorted"+sortArray);
         
        // now add in the third subject
        third_subject = sortArray[0][3];
        
        outputArray.push(sortArray[0]);
        sortArray = deleteRow(sortArray,1);
        console.log("3rd subject deleted"+sortArray);
        sortArrayLength -= 1;
        
    }
    

    
    // fourth subject is the most complicated...need to account for all subject areas. Because we haven't deleted the third_subject from a subject specific array either we will do that too.
    if(sortArrayLength>0){
        var fourth_subject = sortArray[0][3];
        
        if (engCount > 2) {}
        if (mathCount > 2) {}
        if (languageCount > 2) {}
        
    }
    
    //console.log("final output");
    //console.log(outputArray);
    
    return; 
    
}



//Interpolates between the closest scale scores, linearly weighted by their nearness and then alters the page to reflect changes
function reverseScaling(hsclasses, theClass, theScore, i) {
    //var colour;
    //var plusminus;
    //var change;
	var score_weighting;
	var j;
	var scaled;

    //console.log(hsclasses);
    //console.log(theClass);
    // "theScore" is the scaled score
    console.log('theScore' + theScore);

    if (theScore < 0 || theScore > 50) {
		// If score is invalid, notify user
        sendAlert("scaled scores are only between 0 and 50");
	}  else {
	
		// Look up the nearest scales in hsclasses to get the scaled score
		var upper = 0;
		var lower = 0;
		var scaled_lower = 0;
		var scaled_upper = 0;
		var scaledVal = 0;
		
		// Find the upper and lower min_agg's
		
		
		// Find the upper and lower min_agg's
		for (j = 20; j <= 50; j += 5) {
		    scaledVal = hsclasses[theClass]['raw_' + j]; //hsclasses['raw_' + j][theClass];
			if (theScore < scaledVal && upper === 0) {
				upper = hsclasses[theClass]['raw_' + j]; //hsclasses['raw_' + j][theClass]; //j;
				scaled_upper = j; //hsclasses['raw_' + j][theClass];
			}
				
			if (theScore >= scaledVal) {
				lower = hsclasses[theClass]['raw_' + j]; //hsclasses['raw_' + j][theClass]; // j;
				scaled_lower = j; 
			}
		}
		
		//console.log("so far; upper:" + scaled_upper + " lower:" + scaled_lower);
		console.log("so far; upper:" + upper + " lower:" + lower + "the score" + theScore);
		
		if (lower == theScore)
		{
			scaled = scaled_lower;
		} else if (lower === 0) {
			// Score is < 20
			// Assume that 0 is scaled to 0 and use that as the lower value
			score_weighting = (theScore - lower) / (upper - lower);
			scaled = score_weighting * scaled_upper + (1 - score_weighting) * scaled_lower;
		} else if (upper === 0) {
			// Score of 50
			// Should already have been sorted.
			// set the upper to the same as the lower
			upper = lower;

            //score_weighting = (theScore - lower);
            //scaled = score_weighting * scaled_lower + (1 - score_weighting) * scaled_lower;
            scaled = lower;
			//sendAlert("Logic error 634");
			
		} else {
			// Score is 20 or above, but less than or equal to 50
			
			// Gives percentage of weighing
			score_weighting = (theScore - lower) / (upper - lower);
			
			// Takes the weightings and applies to to the scaled score linearly
			scaled = score_weighting * scaled_upper + (1 - score_weighting) * scaled_lower;
		}
        
        //if(scaled<20 )
        
        console.log("raw score:" + scaled);
        
        document.getElementById("raw" + i).value = parseFloat(scaled).toFixed(2);
        
        //document.getElementById("class" + i + "result").value = parseFloat(theScore).toFixed(2);

        return parseFloat(scaled).toFixed(2);
    }
    
    return 0;

}






//Interpolates between the closest scale scores, linearly weighted by their nearness and then alters the page to reflect changes
function setScaling(hsclasses, theClass, theScore, i) {
    var colour;
    var plusminus;
    var change;
	var score_weighting
	var j;
	var scaled;

//console.log(hsclasses);
//console.log(theClass);
console.log("the score" + theScore);

	if (theClass.substring(0, 3) == "VV-") {
		// VET-Other
		//No Score required, gets 10% of top 4 classes
		
		var newScore = -1;
		
		// Write out the changes
        document.getElementById("scaling" + i).innerHTML = "<span class='grey'> N/a </span>";
        document.getElementById("class" + i + "result").value = newScore;
        return newScore;
		
    } else if(theClass.substring(0, 3) == "HE-") {
		// Higher Education class
		// Score just gets transferred as a 10% class. No scaling.
		//if(theScore < 3 || theScore > 5) {
			// The score is invalid
		//	sendAlert("Higher Education scores are only between 0 and 5");
        //               theScore = 0;
        //                document.getElementById("raw" + i).value = 0;
		//}
		
		// Write out the changes
        //document.getElementById("scaling" + i).innerHTML = "<span class='grey'> N/a </span>";
        //document.getElementById("class" + i + "result").value = parseInt(theScore/10);
        return theScore;
	
	} else if (theScore < 0 || theScore > 50) {
		// If score is invalid, notify user
        sendAlert("Raw scores are only between 0 and 50");
	
	} else if (theClass === "") {
		log("Error: Class sent to setScaling() was null");
		return 0;
	} else {
	
		// Look up the nearest scales in hsclasses to get the scaled score
		var upper = 0;
		var lower = 0;
		var scaled_lower = 0;
		var scaled_upper = 0;
		
		// Find the upper and lower min_agg's

        //console.log(hsclasses['EN'])
		for (j = 20; j <= 50; j += 5) {
			if (theScore < j && upper == 0) {
				upper = j;
				scaled_upper = hsclasses[theClass]['raw_' + j];
                console.log(scaled_upper);
			}
				
			if (theScore >= j) {
				lower = j;
				scaled_lower = hsclasses[theClass]['raw_' + j];
			}
		}
		
		if (lower == theScore)
		{
			scaled = scaled_lower;
		} else if (lower == 0) {
			// Score is < 20
			// Assume that 0 is scaled to 0 and use that as the lower value
			score_weighting = (theScore - lower) / (upper - lower);
			scaled = score_weighting * scaled_upper + (1 - score_weighting) * scaled_lower;
		} else if (upper == 0) {
			// Score of 50
			// Should already have been sorted.
			sendAlert("Logic error 634");
		} else {
			// Score is 20 or above, but less than or equal to 50
			
			// Gives percentage of weighing
			score_weighting = (theScore - lower) / (upper - lower);
			
			// Takes the weightings and applies to to the scaled score linearly
			scaled = score_weighting * scaled_upper + (1 - score_weighting) * scaled_lower;
		}
		
		// simplifying the function and just returning the scaled score here
		return parseFloat(scaled).toFixed(2);
        
        // Set appropriate colour and value
        if (scaled == theScore) {
            colour = "grey";
            plusminus = "+";
            change = 0;
        } else if (scaled < theScore) {
            colour = "red";
            plusminus = "";
            change = scaled - theScore;
        } else {
            colour = "green";
            plusminus = "+";
            change = scaled - theScore;
        }
        
        // Check score is not negative
        if (+theScore + +change < 0) {
            change = - theScore;
        }
        
        // Write out the changes
        
        // removed 13/07/2019
        //document.getElementById("scaling" + i).innerHTML = "<span class='" + colour + "'>" + plusminus +  change + "</span>";
        //console.log("change"+change);
        
        //document.getElementById("class" + i + "result").value = parseInt(100 * (+theScore + +change)) / 100;
        
        document.getElementById("class" + i + "result").value = parseFloat(+theScore + +change).toFixed(2);
        //return parseInt(100 * (+theScore + +change)) / 100;
        return parseFloat(+theScore + +change).toFixed(2);
    }
    
    return 0;

}



function setFinalScore(score, atar) {
    // Round to 2 decimal points
    var atar_round;
    atar_round = Math.round(parseInt(atar * 100)/5)*5;
    
    atar = parseInt(atar_round) / 100;
    score = parseInt(score * 100) / 100;
    
    // Update page
    
    document.getElementById("final_score").value = score.toFixed(2);
    document.getElementById("final_atar").value = atar.toFixed(2);
    document.getElementById("atar_submit").value = atar.toFixed(2);
}


function getAggregateScore(atar_goal, scaled_agg) {
    //get the aggregate score from the provided atar 
    //console.log("atar_goal" + atar_goal);
    
    var score = parseFloat(atar_goal);
    var i;
    var j;
    var classScore = 0.00;
    
    // Look up the aggregate score in scaled_agg to get the ATAR score
    var upper = 0;
    var lower = 0;
    var atar_lower = 0;
    var atar_upper = 0;
    
    // determine the aggregate score
    // Find the upper and lower min_agg's
    for (i in scaled_agg.ATAR) {
        if (score < scaled_agg.ATAR[i] && upper == 0) {
            upper = scaled_agg.ATAR[i];
            atar_upper = scaled_agg.min_aggregate[i];
        }
            
        if (score >= scaled_agg.ATAR[i]) {
            lower = scaled_agg.ATAR[i];
            atar_lower = scaled_agg.min_aggregate[i];
        }
    }
    
    // Gives percentage of weighting
    var score_weighting = (score - lower) / (upper - lower);
        
    // Takes the weightings and applies to to the atar scores linearly
    var atar = score_weighting * atar_upper + (1 - score_weighting) * atar_lower;
    
    //console.log("aggregate score:" +atar);
    
    // Update page
    setFinalScore(atar, score);
    return atar;
    
}

// function to sort subjects and determine the top4 5 and 6 based on VTAC rules
function sortSubject(array_in ){
    var i;
    var sortArray = array_in;
    var theClass;
    
    // Running tallies of max class limited subjects, and 
    var engCount = 0;
    var mathCount = 0;
    var musicCount = 0;
    var industryCount = 0;
    var historyCount = 0;
    var ausCount = 0;
    var csitCount = 0;
    var languageCount = 0;
	
	// Need to do special stuff if a VCE VET - Other class is found
	var vvoFound = false;
    
    // Top scores in limited class types
    var english = [];
    var math = [];
    var music = [];
    var industry = [];
    var history = [];
    var aus = [];
    var csit = [];
    var language = [];
    
    var max = [0, 0];
	var max_class = [0, 0];
    var thisClass;
    var temp = [0, 0];
    var j;
    
    var outputArray = [];
    
       for (i = 0; i < sortArray.length; i += 1) {
        // get class code
        theClass = sortArray[i][3];
                
                
        // Check if an English Subject
        if (theClass == "EN" || theClass == "EF" || theClass == "EG" || theClass == "LI") {
            engCount += 1;
            sortArray[i][6] = sortArray[i][2];
            if(engCount==1) {sortArray[i][6] = 100; }
            if(engCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][2]*0.1).toFixed(2);  }
            
            english.push(sortArray[i]);
            outputArray.push(sortArray[i]);
            console.log("english:"+english);
            
            // no need to sort, we do this earlier and it flows through here
            
         } // Mathematics
         else if (theClass == "NF" || theClass == "NJ" || theClass == "NS") {
            mathCount += 1;
            if(mathCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][2]*0.1).toFixed(2);}
                sortArray[i][6] = sortArray[i][2];  
            math.push(sortArray[i]);
           outputArray.push(sortArray[i]);
            console.log("math:"+math);
            
         } // Language
         else if (theClass == 'AR' || theClass == 'AM' || theClass == 'AU' || theClass == 'BE' || theClass == 'LO50' || theClass == 'LO53' || theClass == 'CN' || theClass == 'LO57' || theClass == 'CK' || theClass == 'CL' || theClass == 'AG' || theClass == 'LO51' || theClass == 'CR' || theClass == 'DU' || theClass == 'FP' || theClass == 'FR' || theClass == 'GN' || theClass == 'MG' || theClass == 'HB' || theClass == 'HI' || theClass == 'HU' || theClass == 'AI' || theClass == 'IN' || theClass == 'IX' || theClass == 'IL' || theClass == 'JA' || theClass == 'JS' || theClass == 'LO55' || theClass == 'KH' || theClass == 'KO' || theClass == 'KS' || theClass == 'LA' || theClass == 'MA' || theClass == 'ML' || theClass == 'PN' || theClass == 'PO' || theClass == 'PG' || theClass == 'LO49' || theClass == 'RO' || theClass == 'RU' || theClass == 'SE' || theClass == 'SI' || theClass == 'SP' || theClass == 'SW' || theClass == 'TA' || theClass == 'TU' || theClass == 'UK' || theClass == 'LO54' || theClass == 'LO31' || theClass == 'LO52') {
            languageCount += 1;
            if(languageCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][2]*0.1).toFixed(2);}
                sortArray[i][6] = sortArray[i][2]; 
            language.push([sortArray[i]]);
            outputArray.push(sortArray[i]);
            console.log("language:"+language);
         } // Music
         else if (theClass == "MD" || theClass == "MC04" || theClass == "MC05") {
            musicCount += 1;
            if(musicCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][1]*0.1).toFixed(2);}
                sortArray[i][6] = sortArray[i][2]; 
            music.push(sortArray[i]);
            outputArray.push(sortArray[i]);
            console.log("music:"+music);
            
         } // History
         else if (theClass == 'HI17' || theClass == 'HA' || theClass == 'HR') {
             historyCount += 1;
            if(historyCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][1]*0.1).toFixed(2);}
            sortArray[i][6] = sortArray[i][2]; 
             history.push(sortArray[i]);
             outputArray.push(sortArray[i]);
            console.log("history:"+history);
         } // CSIT
         else if (theClass == "AL03" || theClass == "IT02" || theClass == "IT03" || theClass == "IN60") {
            csitCount += 1;
            if(csitCount > 2) {sortArray[i][2] = parseFloat(sortArray[i][1]*0.1).toFixed(2); }
            sortArray[i][6] = sortArray[i][2]; 
            csit.push(sortArray[i]);
            outputArray.push(sortArray[i]);
            console.log("csit:"+csit);
         } // VV-O
         else if (theClass == "VV-O") {
            vvoFound = true;
		} else {
            // Another subject was found ??
            outputArray.push(sortArray[i]);
            sortArray[i][6] = sortArray[i][2];
        }
    }
    
    return sortArray;
}


function getFinalScore_new(total_scaled, scaled_agg) {
    var score = parseFloat(total_scaled);
    var i;
    var j;
    var classScore = 0.00;
    
    // Look up the aggregate score in scaled_agg to get the ATAR score
    var upper = 0;
    var lower = 0;
    var atar_lower = 0;
    var atar_upper = 0;

    console.log(scaled_agg['min_aggregate']);
    
    // Find the upper and lower min_agg's
    for (i in scaled_agg.min_aggregate) {
        if (score < scaled_agg.min_aggregate[i] && upper == 0) {
            upper = scaled_agg.min_aggregate[i];
            atar_upper = scaled_agg.ATAR[i];
        }
            
        if (score >= scaled_agg.min_aggregate[i]) {
            lower = scaled_agg.min_aggregate[i];
            atar_lower = scaled_agg.ATAR[i];
        }
    }
    
    // changes to "final_score" and "final_atar" from innerHTML to value
    
    // populate "Aggregate Contribution"
    if (lower == 0) {
        // Score is < 40 ATAR
        document.getElementById("final_score").value = parseInt(score*100)/100;
        document.getElementById("final_atar").value = "N/A";
        return 0;
    } else if (upper == 0) {
        // Score is a 99.95 ATAR
        document.getElementById("final_score").value = parseInt(score*100)/100;
        document.getElementById("final_atar").value = "99.95";
        return 99.95;
    } else {
        // ATAR score is 40 or above, but less than or equal to 99.95
        
        // Gives percentage of weighting
        var score_weighting = (score - lower) / (upper - lower);
        
        // Takes the weightings and applies to to the atar scores linearly
        var atar = score_weighting * atar_upper + (1 - score_weighting) * atar_lower;
		
		if(atar <= 0) {
			console.log("ATAR freaked out.");
			document.getElementById("final_score").value = parseInt(score*100)/100;
			document.getElementById("final_atar").value = "N/A";
			return 0;
		}
        
        // Update page
        setFinalScore(score, atar);
        return score;
    }
}



function getFinalScore(scaled, scaled_agg) {
    var score = 0.00;
    var i;
    var j;
    var classScore = 0.00;
    
	// Check if there is an English in class 1
	if(document.getElementById("class1").value == "") {
		document.getElementById("final_score").value = parseInt(score*100)/100;
        document.getElementById("final_atar").value = "<span class='red'>An English class is required</span>";
        return 0;
	}
	
    // Sum all the scores to get the aggregate score
	// First 6 subjects
    for (j = 1; j < 7; j += 1) {
                     /// if (document.getElementById("class" + i + 1 + "result") === null) {
                     //      classScore = 0; } else {
                           classScore = parseInt(document.getElementById("class" + j + "result").value * 100)/100 ;
                    // report on the score for first 6 subjects
                    log("score :"+j+" "+classScore);
                    
                    // get the positions of the top 4 scores
                    

                    score = score + classScore;
}

    for (i = 0; i < 4; i += 1) {
		if (scaled[i] > 0) {
//			score = score + scaled[i];

		}

    }
	// 10% of subjects 5 and 6
	for (i = 4; i < 6; i += 1) {
		if (scaled[i] > 5) {
		//	score = score + (scaled[i] / 10);
		}
	}
    
    // Look up the aggregate score in scaled_agg to get the ATAR score
    var upper = 0;
    var lower = 0;
    var atar_lower = 0;
    var atar_upper = 0;
    
    // Find the upper and lower min_agg's
    for (i in scaled_agg.min_aggregate) {
        if (score < scaled_agg.min_aggregate[i] && upper == 0) {
            upper = scaled_agg.min_aggregate[i];
            atar_upper = scaled_agg.ATAR[i];
        }
            
        if (score >= scaled_agg.min_aggregate[i]) {
            lower = scaled_agg.min_aggregate[i];
            atar_lower = scaled_agg.ATAR[i];
        }
    }
    
    // populate "Aggregate Contribution"
    if (lower == 0) {
        // Score is < 40 ATAR
        document.getElementById("final_score").value = parseInt(score*100)/100;
        document.getElementById("final_atar").value = "N/A";
        return 0;
    } else if (upper == 0) {
        // Score is a 99.95 ATAR
        document.getElementById("final_score").value = parseInt(score*100)/100;
        document.getElementById("final_atar").value = "99.95";
        return 99.95;
    } else {
        // ATAR score is 40 or above, but less than or equal to 99.95
        
        // Gives percentage of weighting
        var score_weighting = (score - lower) / (upper - lower);
        
        // Takes the weightings and applies to to the atar scores linearly
        var atar = score_weighting * atar_upper + (1 - score_weighting) * atar_lower;
		
		if(atar <= 0) {
			console.log("ATAR freaked out.");
			document.getElementById("final_score").value = parseInt(score*100)/100;
			document.getElementById("final_atar").value = "N/A";
			return 0;
		}
        
        // Update page
        setFinalScore(score, atar);
        return atar;
    }
}

function deleteRow(arr, row) {
    console.log(arr);
    console.log(row);

   arr = arr.slice(0); // make copy
   
   arr.splice(row - 1, 1);
   return arr;
}

// Sends the string to the dev console
function log(var1) {
	if(alerts_on == true) {
		console.log(var1);
	}
}