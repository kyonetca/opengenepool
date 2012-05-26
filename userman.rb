#userman.rb - manages user stuff.

require 'mysql'

def amisuperuser()
  #make sure we have a session username
  if (session[:user] == nil)
    return false
  end

  dbh=Mysql.real_connect($dbhost,$dblogin,$dbpass, $dbname)

    #let's make sure there are tables (presumably, including a users table)
    if (dbh.list_tables.length() == 0)
      dbh.close if dbh
      return false
    end

    res = dbh.query("SELECT * FROM users WHERE login = '" + session[:user] + "';")
    row = res.fetch_hash()
  dbh.close if dbh

  return (Integer(row['level']) <= 1) #levels one and zero are wheel users.
end

#handle logins.  Will redirect to the "callback" parameter, if available;
#the callback path is set if a non-user-dependent webpage is accessed.
#TODO: handle returning the user to the path they logged in from.

post '/login' do
  #access parameters.
  $login = params[:login]
  $password = params[:pass]
  $callback = params[:callback]

  #TODO: sanitize so that we don't have a mysql injection attack.

  #check to make sure that this user exists:
  dbh=Mysql.real_connect("localhost","www-data","","ogp")
    res = dbh.query("SELECT * FROM users WHERE login = '" + $login + "' AND hash = SHA('" + $password + "');")

    if (res.num_rows == 1)
      #set the session variable.
      session[:user] = $login
      #TODO: log the session in the list of sessions.
    end

  dbh.close if dbh

  #generate the redirect.
  redirect ($callback.nil? && "/") || $callback
end

#handle clearing the logout.  Redirects back to the main page, always.
get '/logout/' do
  session[:user] = nil
  redirect "/"
end

get '/whoami/' do
  "<html>" + session[:user] + "</html>"
end

get '/userlist/' do
  #TODO: put a user check in place here.
  #we don't want unauthorized access to this list.

  $users = Array.new();

  #connect to the database.
  dbh=Mysql.real_connect($dbhost,$dblogin,$dbpass, $dbname)
    #query the entire list.
    res=dbh.query("SELECT * FROM users")
   
    #for each row
    (1..res.num_rows).each do
      #grab the data and it into a hash.
      row = res.fetch_hash()
      #push the data ono the users array.
      $users.push(row)
    end
  dbh.close if dbh

  #output as the user list utility.
  haml :userlist
end

get '/makeuser/' do
  #TODO: put a user check in place here.
  #no unauthorized access to user creation option.

  haml :makeuser
end

post '/makeuser/' do
  #TODO: put a user check in place here.
  #no unauthorized access to user creation.
  $login=params[:login]
  $email=params[:email]
  $passwd=params[:pass]
  $mystring = ""

  #check to make sure that the name doesn't exist in the database already.
  dbh=Mysql.real_connect($dbhost,$dblogin,$dbpass, $dbname)

    #use a SELECT query to check if the user name exists
    res=dbh.query('SELECT * FROM users WHERE login = "' + $login + '"')
   
    #to be successful, the count has to be zero.
    if (res.num_rows != 0)
      $error = true;
    else
      res=dbh.query("INSERT INTO users (login, email, hash) VALUES ('#{$login}','#{$email}',PASSWORD('#{$passwd}'))")
      #TODO: error checking and handling. 
    end

  dbh.close if dbh

  if ($error)
    "error, try a different name."
  else
    redirect "/makeuser/"
  end
end