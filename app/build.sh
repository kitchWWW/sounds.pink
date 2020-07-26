 #!/bin/bash 
timestamp=$(date +%s)
zip -r app.zip ./* .ebextensions > /dev/null
mv app.zip ../dist/$timestamp.zip 
echo $timestamp
