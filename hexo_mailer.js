var fs = require('fs');
var ejs = require('ejs');
var FeedSub = require('feedsub');
var mandrill = require('mandrill-api/mandrill');

var mandrill_client = new mandrill.Mandrill('-CCXC-U7hE4J7M3BB-tRXA');
var blogContent = new FeedSub('http://j1ands.github.io/atom.xml', {
        emitOnStart: true
});

/*
blogContent.read(function(err,blogPosts){
    console.log(blogPosts);
});
*/

var latestPosts = [];



var csvFile = fs.readFileSync("friends_list_test.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8')

//console.log(csvFile);



function csvParse(csvFile)
{
	//var csvKeys = [];
	var csvObject = {};
	var lines = csvFile.split('\n');
	var categories = lines[0].split(',');
	for(var x = 0; x < categories.length; x++)
	{
		//csvKeys.push(categories[x])
		csvObject[categories[x]] = "";
	}
	var parsedCSV = [];
	lines.shift();
	//var fields = lines.split(',');
	var line = "";
	//Ask about better way to add object instead of checking for last element.
	lines.forEach(function(e1,i1)
	{
		parsedCSV.push({});
		line = e1.split(',');
		//console.log(line);

		line.forEach(function(e2, i2)
		{
			parsedCSV[i1][categories[i2]] = e2;
		})
		
		//console.log(csvObject);
		//parsedCSV.push(csvObject);
		//console.log(parsedCSV[i1])
		
	});
	//parsedCSV.forEach(function(ele,ind)
	//{
	//	console.log(parsedCSV[ind]);
	//});
	return parsedCSV;

}

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
  var message = {
      "html": message_html,
      "subject": subject,
      "from_email": from_email,
      "from_name": from_name,
      "to": [{
              "email": to_email,
              "name": to_name
          }],
      "important": false,
      "track_opens": true,    
      "auto_html": false,
      "preserve_recipients": true,
      "merge": false,
      "tags": [
          "Fullstack_Hexomailer_Workshop"
      ]    
  };
  var async = false;
  var ip_pool = "Main Pool";
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
       console.log(message);
       console.log(result);   
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
};

blogContent.read(function(err,blogPosts)
{
 
  	blogPosts.forEach(function(post)
  	{
  
  // CHECK IF POST IS 7 Days old or Less. If it is, put the post object in the array.
  	console.log(post.published);
  	postTime = post.published.split('-');
  	postTimeYear = postTime[0];
  	postTimeMonth = postTime[1];
  	postTimeDay = postTime[2].split('T')[0];
  	postTime = ((postTimeYear - 1970) * 31556952000) + ((postTimeMonth-1) * 2629740000) + ((postTimeDay-1) * 86400000)
  	time = new Date();
  	console.log(postTime);
  	console.log(time.getTime());

  	//if(time - postTime <= 604800000)
  	if(time - postTime <= 2630000000)
  	{
  		//console.log(post);
  		latestPosts.push(post);
  	}
  
 
  	});

	var csvData = csvParse(csvFile);

	csvData.forEach(function(row)
	{
		firstName = row["firstName"];
		numMonthsSinceContact = row["monthsSinceContact"];
		copyTemplate = emailTemplate;
		var customizedTemplate = ejs.render(copyTemplate, 
			{ 
			  firstName: firstName,  
			  monthsSinceContact: numMonthsSinceContact, 
			  latestPosts: latestPosts 
			});
		sendEmail(row["firstName"] + " " + row["lastName"], row["emailAddress"], "Jordan Landau", "jordan.landau@richmond.edu", "j1ands.github.io Latest Blog Posts", customizedTemplate);
	//console.log(customizedTemplate);
	/*
	templateCopy = emailTemplate;
	templateCopy = templateCopy.replace(/FIRST_NAME/gi, firstName).replace(/NUM_MONTHS_SINCE_CONTACT/gi, numMonthsSinceContact);
	*/
	//console.log(templateCopy);
	});
});

//console.log(csvData);
