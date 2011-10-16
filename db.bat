IF NOT EXIST db mkdir db
bin\mongod --bind_ip 127.0.0.1 --port 4444 --dbpath db
pause