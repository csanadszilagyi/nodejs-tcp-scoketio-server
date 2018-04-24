$(function(){


const ORDER_TYPES = {
  NONE: 0,
  STOP_ALL: 1,
  STOP_CURRENT: 2,
  START_RIGHT: 3,
  START_LEFT: 4
};

	//FORM HANDLING
	function validInput(str) {
		return str !== "";
	}

	//SOCKET.IO
	var socket = io();
	var $listContainer = $('#messages');
  
  function SocketMessage (message, order, type) {
  	this.sender = 'web app';
    this.message = message;
    this.order = order;
    this.type = type;
	}	
  
  var socketMsg = new SocketMessage("", 0, 0);
 /*
	SocketMessage.prototype.getInfo = function() {
	    return this.color + ' ' + this.type + ' apple';
	};
*/
	function sendIO_ToBackend(socket_msg) {
		var jsonSocket = JSON.stringify(socketMsg);
	  socket.emit('io-socket', jsonSocket);
	}

	$('form').on('submit', function(){
			// prevent sending empty message
			var str = $.trim($('#msg').val());
			if(true == validInput(str) ) {
				socketMsg.message = str;
				sendIO_ToBackend(socketMsg);
	      $('#msg').val('');
    	}
    	return false;
  });

	// vezérlő gombok click eseménye
	$('#btn-right').on('click', function(e) {
		//M.toast({html: 'right click!'}); 
		socketMsg.message = "";
		socketMsg.order = ORDER_TYPES.START_RIGHT;
		socketMsg.type = 0;
		sendIO_ToBackend(socketMsg);
	});

	$('#btn-left').on('click', function(e) {
		
	});

	$('#btn-stop').on('click', function(e) {
		 
	});
  // expecting json
	socket.on('io-socket', function(json_str){
		// M.toast({html: msg}); 
		var receivedSocketMsg = JSON.parse(json_str);
    $listContainer.append( createMessage(receivedSocketMsg.sender, receivedSocketMsg.message, {type: 'grade', color: 'green'}) );
  });

	// expecting simple string
  socket.on('io-server', function(msg){
    $listContainer.append( createMessage("server", msg, {type: 'adjust', color: 'orange'} ) );
  });

 // when server is live and we have tcp connections already, and website is loaded after that...
/*
	socket.on('new-connection', function(tcp_cons_json) {
		var tcpCons = JSON.parse(tcp_cons_json);
		for (var i = 0; i < tcpCons.length; i++) {
			$listContainer.append( createMessage(2, tcpCons[i].name) );
		}
  });
*/

	function createMessage(title, body, icon) {
		 var item = document.createElement("li");
     item.classList.add("collection-item", "avatar");
     item.innerHTML = `<i class="small material-icons circle ${icon.color}">${icon.type}</i>
      <span class="title text-bold">${title}</span>
      <p>${body}</p>`;
     return item;
	}
});