var editor =
{
  sequence_id: 0, 	//the sequence id number that is used.
  sequence_name: "",	//the name used to send the AJAX query
  queryresult: "",	//the raw output from the AJAX query
  queriedxml: {},	//jQuery-processed AJAX query xml
  sequence: "",		//the actual sequence

  //plugin management
  plugins: [],

  //initialization function that is passed a list of plugins from sinatra.
  load: function(query)
  {
    //check to see if we're embedding the request as an ID value.
    //then set up the AJAX query to retrieve the information

    if (query.substring(0,3) == "id=")
    { 
      this.sequence_id = query.substring(3);
    }
    else
    {
      this.sequence = query;    
    }

    //prepare HTTP request object.
    var xmlhttp = new XMLHttpRequest();

    //set the AJAX wait response.
    xmlhttp.onreadystatechange=
    function()
    {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
      {
        editor.queryresult = xmlhttp.responseText;
        //use jQuery to parse the XML of the query.
        var xdoc = $.parseXML(editor.queryresult);
        queriedxml = $(xdoc);
          
        //use the xml jQuery object to find the sequence tag and use it.
        editor.sequence = queriedxml.find("sequence").text().trim();
        editor.sequence_name = queriedxml.find("name").text().trim();
        editor.sequence_id = parseInt(queriedxml.find("id").text().trim());

        //submit this information to the infobox.
        var infobox = document.getElementById("infobox");
        infobox.innerHTML = "<h2>" + editor.sequence_name + "</h2>" + editor.sequence.length + "bp";

        editor.initialize();
        //editor.newsequence();
      }
    }

    //send the AJAX query.  here we are passing the 'id/name-detection' buck to the seq.rb file.
    xmlhttp.open("GET","../seq/" + query,true);
    xmlhttp.send();
  },

  initialize: function()
  {
    graphics.initialize();
  }
} 
