
  // as soon as this file is loaded, connect automatically,
  var socket = io.connect();


  socket.on('connect', function socketConnected() {

    console.log('This is from the connect: ', this.socket.sessionid);

    socket.on('message', function(message) {
      console.log("Here's the message", message);
    });

    ///////////////////////////////////////////////////////////
    // Here's where you'll want to add any custom logic for
    // when the browser establishes its socket connection to
    // the Sails.js server.
    ///////////////////////////////////////////////////////////
    console.log(
        'Socket is now connected and globally accessible as `socket`.\n' +
        'e.g. to send a GET request to Sails, try \n' +
        '`socket.get("/", function (response) ' +
        '{ console.log(response); })`'
    );
    ///////////////////////////////////////////////////////////


  });

  socket.on('disconnect', function() {

  });
