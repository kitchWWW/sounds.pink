var http = require("http"),
  url = require("url"),
  path = require("path"),
  fs = require("fs")
port = process.env.PORT || 3000;


var formidable = require('formidable');

const runSpawn = require('child_process').spawn;

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

function serverLog(data) {
  console.log("***" + Date.now() + " " + data);
}


function writeToHistory(user, sample, action) {
  if (user) {
    var bits = user.split("=|=|=|=|=");
  } else {
    bits = ['', 'Anon'];
  }
  var actionLog = bits[1] + " " + action + " " + sample + '\n';
  console.log(actionLog);
  fs.appendFile("server.log", actionLog, function(err) {});
}


function writeToChat(user, chat_text) {
  if (user) {
    var bits = user.split("=|=|=|=|=");
  } else {
    bits = ['', 'Anon'];
  }
  var chatLog = bits[1] + ": " + chat_text + '\n';
  console.log(chatLog);
  console.log("***" + Date.now() + " chat: " + chatLog);
  fs.appendFile("chat.log", chatLog, function(err) {});
}


function stripName(id) {
  if (id) {
    return id.split("=|=|=|=|=")[0];
  }
  return "none";
}


function getCustomCode(callbackFunc) {
  const directoryPath = path.join(__dirname, 'positions/');
  const files_names = [];
  fs.readdir(directoryPath, function(err, files) {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function(file) {
      // Do whatever you want to do with the file
      console.log(file);
      files_names.push(file);
    });
    validCodeParts = 'ABCDEFGHJKLMNPQRSTUVWXYZ3456789'
    do {
      a = validCodeParts.substring(Math.floor(Math.random() * Math.floor(validCodeParts.length))).substring(0, 1);
      b = validCodeParts.substring(Math.floor(Math.random() * Math.floor(validCodeParts.length))).substring(0, 1);
      c = validCodeParts.substring(Math.floor(Math.random() * Math.floor(validCodeParts.length))).substring(0, 1);
      d = validCodeParts.substring(Math.floor(Math.random() * Math.floor(validCodeParts.length))).substring(0, 1);
      candidateCode = a + b + c + d
    } while (files_names.indexOf(candidateCode) >= 0)
    callbackFunc(candidateCode);
  });
  return
}



function getName(id) {
  if (id) {
    return id.split("=|=|=|=|=")[1];
  }
  return "Anon";
}

//copy the $file to $dir2
var copyFile = (file, dir2, new_name, callbackFunc) => {
  //gets file name and adds it to dir2
  var f = path.basename(file);
  var source = fs.createReadStream(file);
  var dest = fs.createWriteStream(path.resolve(dir2, new_name));

  source.pipe(dest);
  source.on('end', function() {
    console.log('Succesfully copied');
    callbackFunc();
  });
  source.on('error', function(err) {
    console.log(err);
  });
};


var server = http.createServer(function(request, response) {
  console.log(request.method);
  console.log(request.url);
  if (request.method === "GET") {
    if (request.url.startsWith("/newPoseStage")) {
      getCustomCode(function(code) {
        response.writeHead(307, {
          Location: '/performPose.html?code='+code
        });
        response.end();
      })
      return;
    }else if (request.url.startsWith("/newEmotionStage")) {
      getCustomCode(function(code) {
        response.writeHead(307, {
          Location: '/performEmotion.html?code='+code
        });
        response.end();
      })
      return;
    }else if (request.url.startsWith("/newDeviceStage")) {
      getCustomCode(function(code) {
        response.writeHead(307, {
          Location: '/performDevice.html?code='+code
        });
        response.end();
      })
      return;
    }else if (request.url.startsWith("/getCustomCode")) {
      getCustomCode(function(code) {
        response.writeHead(200, {
          'content-type': 'text/plain'
        });
        response.write(JSON.stringify(code));
        response.end();
      })
      return;
    }

    var uri = url.parse(request.url).pathname,
      filename = path.join(process.cwd(), uri);

    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    serverLog(stripName(query.id));
    fs.exists(filename, function(exists) {
      if (!exists) {
        response.writeHead(404, {
          "Content-Type": "text/plain"
        });
        response.write("404 Not Found\n");
        response.end();
        return;
      }

      if (fs.statSync(filename).isDirectory()) filename += '/index.html';

      fs.readFile(filename, "binary", function(err, file) {
        if (err) {
          response.writeHead(500, {
            "Content-Type": "text/plain"
          });
          response.write(err + "\n");
          response.end();
          return;
        }
        response.writeHead(200);
        response.write(file, "binary");
        response.end();
      });
    });
  }

  if (request.method === "POST") {
    var uri = url.parse(request.url).pathname,
      filename = path.join(process.cwd(), uri);

    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    serverLog(stripName(query.id));
    if (request.url.startsWith("/dance")) {
      var requestBody = '';
      request.on('data', function(data) {
        requestBody += data;
        if (requestBody.length > 1e20) {
          response.writeHead(413, 'Request Entity Too Large', {
            'Content-Type': 'text/html'
          });
          response.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
        }
      });
      request.on('end', function() {
        // should probably do something to make sure this is an atomic function.
        var data = JSON.parse(requestBody);
        console.log(data);
        var id = data.id;

        let data_to_write = JSON.stringify(data);
        fs.writeFileSync('positions/position_' + id + '.json', data_to_write);
        // step 1: copy the recording into the main file of recordings
        response.writeHead(200, {
          "Content-Type": "text/plain"
        });
        response.write("{}");
        response.end();
        return;
      });
    } else {
      response.writeHead(404, 'Resource Not Found', {
        'Content-Type': 'text/html'
      });
      response.end('<!doctype html><html><head><title>404</title></head><body>404: Resource Not Found</body></html>');
    }
  }

})
server.listen(parseInt(port, 10));
server.on('error', function(e) {
  // Handle your error here
  console.log(e);
});
server.timeout = 1000;

console.log("Server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");