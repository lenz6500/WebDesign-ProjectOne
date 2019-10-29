// Built-in Node.js modules
var fs = require('fs')
var path = require('path')

// NPM modules
var express = require('express')
var sqlite3 = require('sqlite3')


var public_dir = path.join(__dirname, 'public');
var template_dir = path.join(__dirname, 'templates');
var db_filename = path.join(__dirname, 'db', 'usenergy.sqlite3');

var app = express();
var port = 8000;

// open usenergy.sqlite3 database
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
		TestSql();
    }
});

function TestSql(){
	/*
	db.all("SELECT * FROM Consumption WHERE state_abbreviation=? ORDER BY Year", ['MN'], (err, rows)=>{
		console.log(rows);
	});
	db.all("SELECT * FROM States", (err, rows) =>{
		console.log(rows);
	});
	*/
}

app.use(express.static(public_dir));


// GET request handler for '/'
app.get('/', (req, res) => {
    ReadFile(path.join(template_dir, 'index.html')).then((template) => {
        let response = template;
		var coalTotal = 0;
		var naturalGasTotal = 0;
		var nuclearTotal = 0;
		var petroleumTotal = 0;
		var renewableTotal = 0;
		var allStatesData = "";
		db.all("SELECT * FROM Consumption WHERE year = 2017 ORDER BY Year", (err, value)=>{
			if(err){
				console.log("Data not found.");
				//Proper 404 error here later.
			}
			for(i = 0; i < value.length; i++){
				allStatesData = allStatesData + "\t\t<tr>";
				allStatesData = allStatesData + "<td>"+value[i].state_abbreviation+"</td>";
				allStatesData = allStatesData + "<td>"+value[i].coal+"</td>";
				allStatesData = allStatesData + "<td>"+value[i].natural_gas+"</td>";
				allStatesData = allStatesData + "<td>"+value[i].nuclear+"</td>";
				allStatesData = allStatesData + "<td>"+value[i].petroleum+"</td>";
				allStatesData = allStatesData + "<td>"+value[i].renewable+"</td>";
				allStatesData = allStatesData + "</tr>\n";
				coalTotal = coalTotal + value[i].coal;
				naturalGasTotal = naturalGasTotal + value[i].natural_gas;
				nuclearTotal = nuclearTotal + value[i].nuclear;
				petroleumTotal = petroleumTotal + value[i].petroleum;
				renewableTotal = renewableTotal + value[i].renewable;
			}
			response = response.replace("!!TABLE!!", allStatesData);
			response = response.replace("!!COALCOUNT!!", coalTotal);
			response = response.replace("!!NATURALGASCOUNT!!", naturalGasTotal);
			response = response.replace("!!NUCLEARCOUNT!!", nuclearTotal);
			response = response.replace("!!PETROLEUMCOUNT!!", petroleumTotal);
			response = response.replace("!!RENEWABLECOUNT!!", renewableTotal);
			WriteHtml(res, response);
		});
	}).catch((err) => {
		Write404Error(res);
	});
});

// GET request handler for '/year/*'
app.get('/year/:selected_year', (req, res) => {
    ReadFile(path.join(template_dir, 'year.html')).then((template) => {
        let response = template;
		var year = req.url.substring(6);
		var coalTotal = 0;
		var naturalGasTotal = 0;
		var nuclearTotal = 0;
		var petroleumTotal = 0;
		var renewableTotal = 0;
		var stateTotal = 0;
		var allStatesData = "";
		db.all("SELECT * FROM Consumption WHERE year = ? ORDER BY Year", [year], (err, value)=>{
			if(err){
				console.log("Data not found.");
				//Proper 404 error here for later.
			}
			for(i = 0; i < value.length; i++){
				stateTotal = stateTotal + value[i].coal;
				stateTotal = stateTotal + value[i].natural_gas;
				stateTotal = stateTotal + value[i].nuclear;
				stateTotal = stateTotal + value[i].petroleum;
				stateTotal = stateTotal + value[i].renewable;
				allStatesData = allStatesData + "\t\t<tr>";
				allStatesData = allStatesData + "<td>"+value[i].state_abbreviation+"</td>";
				allStatesData = allStatesData + "<td>"+value[i].coal+"</td>";
				allStatesData = allStatesData + "<td>"+value[i].natural_gas+"</td>";
				allStatesData = allStatesData + "<td>"+value[i].nuclear+"</td>";
				allStatesData = allStatesData + "<td>"+value[i].petroleum+"</td>";
				allStatesData = allStatesData + "<td>"+value[i].renewable+"</td>";
				allStatesData = allStatesData + "<td>"+stateTotal+"</td";
				allStatesData = allStatesData + "</tr>\n";
				coalTotal = coalTotal + value[i].coal;
				naturalGasTotal = naturalGasTotal + value[i].natural_gas;
				nuclearTotal = nuclearTotal + value[i].nuclear;
				petroleumTotal = petroleumTotal + value[i].petroleum;
				renewableTotal = renewableTotal + value[i].renewable;
			}
			response = response.replace("!!YEAR!!", year);
			response = response.replace("!!YEAR!!", year);
			response = response.replace("!!TABLE!!", allStatesData);
			response = response.replace("!!COALCOUNT!!", coalTotal);
			response = response.replace("!!NATURALGASCOUNT!!", naturalGasTotal);
			response = response.replace("!!NUCLEARCOUNT!!", nuclearTotal);
			response = response.replace("!!PETROLEUMCOUNT!!", petroleumTotal);
			response = response.replace("!!RENEWABLECOUNT!!", renewableTotal);
			WriteHtml(res, response);
		});
	}).catch((err) => {
		Write404Error(res);
	});
});

// GET request handler for '/state/*'
app.get('/state/:selected_state', (req, res) => {
    ReadFile(path.join(template_dir, 'state.html')).then((template) => {
        let response = template;
		var state = req.url.substring(7);
		var coalString = "[";
		var naturalGasString = "[";
		var nuclearString = "[";
		var petroleumString = "[";
		var renewableString = "[";
		var allYearsData = "";
		var yearTotal = 0;
		var img = "/images/" + req.url.substring(7) + ".png"
		var alt = req.url.substring(7);
        db.all("SELECT * FROM Consumption WHERE state_abbreviation = ? ORDER BY Year", [state], (err, value)=>{
			var i = 0;
			while(i < value.length-1){
				
				yearTotal = yearTotal + value[i].coal;
				yearTotal = yearTotal + value[i].natural_gas;
				yearTotal = yearTotal + value[i].nuclear;
				yearTotal = yearTotal + value[i].petroleum;
				yearTotal = yearTotal + value[i].renewable;
				allYearsData = allYearsData + "\t\t<tr>";
				allYearsData = allYearsData + "<td>"+value[i].year + "</td>";
				allYearsData = allYearsData + "<td>"+value[i].coal + "</td>";
				allYearsData = allYearsData + "<td>"+value[i].natural_gas + "</td>";
				allYearsData = allYearsData + "<td>"+value[i].nuclear + "</td>";
				allYearsData = allYearsData + "<td>"+value[i].petroleum + "</td>";
				allYearsData = allYearsData + "<td>"+value[i].renewable + "</td>";
				allYearsData = allYearsData + "<td>" + yearTotal + "</td>";
				allYearsData = allYearsData + "</tr>\n";
				coalString = coalString + value[i].coal + ", ";
				naturalGasString = naturalGasString + value[i].natural_gas + ", ";
				nuclearString = nuclearString + value[i].nuclear + ", ";
				petroleumString = petroleumString + value[i].petroleum + ", ";
				renewableString = renewableString + value[i].renewable + ", ";
				i++;
			}
			yearTotal = yearTotal + value[i].coal;
			yearTotal = yearTotal + value[i].natural_gas;
			yearTotal = yearTotal + value[i].nuclear;
			yearTotal = yearTotal + value[i].petroleum;
			yearTotal = yearTotal + value[i].renewable;
			allYearsData = allYearsData + "\t\t<tr>";
			allYearsData = allYearsData + "<td>"+value[i].year + "</td>";
			allYearsData = allYearsData + "<td>"+value[i].coal + "</td>";
			allYearsData = allYearsData + "<td>"+value[i].natural_gas + "</td>";
			allYearsData = allYearsData + "<td>"+value[i].nuclear + "</td>";
			allYearsData = allYearsData + "<td>"+value[i].petroleum + "</td>";
			allYearsData = allYearsData + "<td>"+value[i].renewable + "</td>";
			allYearsData = allYearsData + "<td>" + yearTotal + "</td>";
			allYearsData = allYearsData + "</tr>\n";
			coalString = coalString + value[i].coal+ "]";
			naturalGasString = naturalGasString + value[i].natural_gas +"]";
			nuclearString = nuclearString + value[i].nuclear +"]";
			petroleumString = petroleumString + value[i].petroleum +"]";
			renewableString = renewableString + value[i].renewable + "]";

			response = response.replace("!!STATE!!", state);
			response = response.replace("!!STATE!!", state);
			response = response.replace("!!COAL!!", coalString);
			response = response.replace("!!NAT!!", naturalGasString);
			response = response.replace("!!NUKE!!", nuclearString);
			response = response.replace("!!PETRO!!", petroleumString);
			response = response.replace("!!RENEW!!", renewableString);
			response = response.replace("!!TABLE!!", allYearsData);
			response = response.replace("!!IMAGE!!", img);
			response = response.replace("!!ALT!!", alt);
			WriteHtml(res, response);
		});
    }).catch((err) => {
        Write404Error(res);
    });
});

// GET request handler for '/energy-type/*'
app.get('/energy-type/:selected_energy_type', (req, res) => {
    ReadFile(path.join(template_dir, 'energy.html')).then((template) => {
        let response = template;
		var type = req.url.substring(13);
		var currState = "";
		var allStates = "{";
		var i = 0;
		var j = 0;
		var tableStates = "";
		var yearTotal;
		var img = "/images/" + req.url.substring(13) + ".png"
		db.all("SELECT * FROM Consumption ORDER BY state_abbreviation, Year", (err, rows)=>{

			while(i < 51){
				j = 0;
				
				currState = rows[(rows.length/51)*i].state_abbreviation + ": [";
				while(j < (rows.length/51) - 1){
					currState = currState + rows[((rows.length/51)*i)+j][type] + ", ";
					j++;
				}
				currState = currState + rows[((rows.length/51)*i)+j][type] + "], \n";
				allStates = allStates + currState;
				i++;
			}
			allStates = allStates.substring(0, allStates.length-3);
			allStates = allStates + "}";
			db.all("SELECT * FROM Consumption ORDER BY Year, state_abbreviation", (err2, rows2)=>{
				
				i = 0;
				while(i < (rows2.length/51)){
					j = 0;
					yearTotal = 0;
					tableStates = tableStates + "\t\t<tr>";
					tableStates = tableStates + "<td>"+rows2[51*i].year+"</td>";		
					while(j < 51){
						tableStates = tableStates + "<td>" + rows2[(51*i) + j][type] + "</td>";
						yearTotal = yearTotal + rows2[(51*i) + j][type];
						j++;
					}
					tableStates = tableStates + "<td>" + yearTotal + "</td>";
					tableStates = tableStates + "</tr>\n";
					i++;
				}
				
				response = response.replace("!!IMAGE!!", img);
				response = response.replace("!!TABLE!!", tableStates);
				response = response.replace("!!COUNTS!!", allStates);
				response = response.replace("!!ETYPE!!", type);
				response = response.replace("!!TYPE!!", type.charAt(0).toUpperCase() + req.url.substring(14));
				WriteHtml(res, response);			
			});
		});    	      
    }).catch((err) => {
        Write404Error(res);
    });
});

function ReadFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data.toString());
            }
        });
    });
}

function Write404Error(res) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('Error: file not found');
    res.end();
}

function WriteHtml(res, html) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html);
    res.end();
}

var server = app.listen(port);
