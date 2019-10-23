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
	var coalTotal = 0;
	var naturalGasTotal = 0;
	var nuclearTotal = 0;
	var petroleumTotal = 0;
	var renewableTOtal = 0;
	db.all("SELECT state_abbreviation FROM States", (err, rows) =>{

		for(i = 0; i < rows.length; i++){
			console.log(rows[i].state_abbreviation);
			db.all("SELECT coal FROM Consumption WHERE year=2017 AND state_abbreviation=?", [rows[i].state_abbreviation], (err, coalValue)=>{
				coalTotal = coalTotal + coalValue[0].coal;
				console.log(coalTotal);
			});
			//console.log(coalTotal);
		}
	});
}

app.use(express.static(public_dir));


// GET request handler for '/'
app.get('/', (req, res) => {
    ReadFile(path.join(template_dir, 'index.html')).then((template) => {
        let response = template;
        // modify `response` here
        WriteHtml(res, response);
    }).catch((err) => {
        Write404Error(res);
    });
});

// GET request handler for '/year/*'
app.get('/year/:selected_year', (req, res) => {
    ReadFile(path.join(template_dir, 'year.html')).then((template) => {
        let response = template;
        // modify `response` here
	let year = req.url.substring(6);
	var string = '';
	var newPromise = new Promise((resolve,reject) => {
		db.all('SELECT * FROM Consumption WHERE year=? ORDER BY state_abbreviation', [year], (err, rows)=>{
			
		});
			
	})
	newPromise.then(data => {
		
	});
	
	// end modification here
        WriteHtml(res, response);
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
