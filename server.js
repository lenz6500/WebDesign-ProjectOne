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
				coalTotal = coalTotal + value[i].coal;
				allStatesData = allStatesData + "<td>"+value[i].coal+"</td>";
				naturalGasTotal = naturalGasTotal + value[i].natural_gas;
				allStatesData = allStatesData + "<td>"+value[i].natural_gas+"</td>";
				nuclearTotal = nuclearTotal + value[i].nuclear;
				allStatesData = allStatesData + "<td>"+value[i].nuclear+"</td>";
				petroleumTotal = petroleumTotal + value[i].petroleum;
				allStatesData = allStatesData + "<td>"+value[i].petroleum+"</td>";
				renewableTotal = renewableTotal + value[i].renewable;
				allStatesData = allStatesData + "<td>"+value[i].renewable+"</td>";
				allStatesData = allStatesData + "</tr>\n";
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
				allStatesData = allStatesData + "\t\t<tr>";
				allStatesData = allStatesData + "<td>"+value[i].state_abbreviation+"</td>";
				coalTotal = coalTotal + value[i].coal;
				stateTotal = stateTotal + value[i].coal;
				allStatesData = allStatesData + "<td>"+value[i].coal+"</td>";
				naturalGasTotal = naturalGasTotal + value[i].natural_gas;
				stateTotal = stateTotal + value[i].natural_gas;
				allStatesData = allStatesData + "<td>"+value[i].natural_gas+"</td>";
				nuclearTotal = nuclearTotal + value[i].nuclear;
				stateTotal = stateTotal + value[i].nuclear;
				allStatesData = allStatesData + "<td>"+value[i].nuclear+"</td>";
				petroleumTotal = petroleumTotal + value[i].petroleum;
				stateTotal = stateTotal + value[i].petroleum;
				allStatesData = allStatesData + "<td>"+value[i].petroleum+"</td>";
				renewableTotal = renewableTotal + value[i].renewable;
				stateTotal = stateTotal + value[i].renewable;
				allStatesData = allStatesData + "<td>"+value[i].renewable+"</td>";
				allStatesData = allStatesData + "<td>"+stateTotal+"</td";
				allStatesData = allStatesData + "</tr>\n";
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
        // modify `response` here
        WriteHtml(res, response);
    }).catch((err) => {
        Write404Error(res);
    });
});

// GET request handler for '/energy-type/*'
app.get('/energy-type/:selected_energy_type', (req, res) => {
    ReadFile(path.join(template_dir, 'energy.html')).then((template) => {
        let response = template;
        // modify `response` here
	    	      
        WriteHtml(res, response);
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
