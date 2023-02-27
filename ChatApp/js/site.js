
var CurrentSessionId;
var MessagesInCurrentSession;
var ChatSessions=[];
var graphQL_URL="https://localhost:5001/graphql";

function scrollToLastMessage()
{
    if (document.getElementById('chatmessagesdiv')) {
        var elem = document.getElementById('chatmessagesdiv');
        elem.scrollTop = elem.scrollHeight;
        return true;
    }
    return false;
}


function handleClick(action,sessionId, sessionName)
{
	
	switch(action) {
	  case "load":
		loadMessagesInChatSession(sessionId, sessionName);
		break;
	  case "rename":

		let newName = prompt("Please enter new name for chat '" + sessionName + "'", sessionName);
		if (newName == null || newName == "")
		{
			return;
		}

		renameChatSession(sessionId, newName);
		updateChatSessionTile(sessionId, newName);
		break;
	  case "delete":
	  
		var txt;
		if (!confirm("Are you sure you want to delete the chat '"+ sessionName + "'?")) {
			return;
		}		
  
		deleteChatMessages(sessionId);
		deleteChatSession(sessionId);
		loadChatSessionTiles();
				
		break;
	  default:
		alert("to " + action + " for " + sessionName);
	}
	
}

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function deleteChatSession(sessionId)
{
	 $.ajax({
        method: 'POST',
        url: graphQL_URL,
        contentType: "application/json",
        async:false,
        data: JSON.stringify({ query: 'mutation { deleteChat(_partitionKeyValue: "'+ sessionId +'", id: "'+ sessionId +'"){ChatSessionId } }',
		variables: { }
	}),
        success: function(result) {
            console.log(result.data);			
        }
    });	
}


function deleteChatMessages(sessionId)
{
	
	 $.ajax({
        method: 'POST',
        url: graphQL_URL,
        contentType: "application/json",
        async:false,
        data: JSON.stringify({    
		query: '{messages(filter: { ChatSessionId: { eq: "'+ sessionId +'" } }){ items { id }}}',
		variables: { }
	}),
        success: function(result) {
            console.log(result.data);
			
			if(CurrentSessionId==sessionId)
				CurrentSessionId="";
			
			if(result.data.messages.items.length>0)
			{
				for (var i = 0; i < result.data.messages.items.length; i++) {
					
					deleteMessage(result.data.messages.items[i].id);

				}
			}
			
        }

    });
}

function deleteMessage(sessionId, id)
{
	 $.ajax({
        method: 'POST',
        url: graphQL_URL,
        contentType: "application/json",
        async:false,
        data: JSON.stringify({ query: 'mutation { deleteMessage(_partitionKeyValue: "'+ sessionId +'", id: "'+ is +'"){ChatSessionId } }',
		variables: { }
	}),
        success: function(result) {
            console.log(result.data);			
        }
    });	
}


function renameChatSession(sessionId, sessionName)
{
	 $.ajax({
        method: 'POST',
        url: graphQL_URL,
        contentType: "application/json",
        async:false,
        data: JSON.stringify({ query: 'mutation {updateChat (  _partitionKeyValue: "'+ sessionId +'" id: "'+ sessionId +'"   item: {id: "'+ sessionId +'", Name: "'+ sessionName +'", ChatSessionId: "'+ sessionId +'" }) { id }}',
		variables: { }
	}),
        success: function(result) {
            console.log(result.data);			
        }
    });	
}



function createChatSession(sessionName)
{
	
	var id=generateUUID()
	
	 $.ajax({
        method: 'POST',
        url: graphQL_URL,
        contentType: "application/json",
        async:false,
        data: JSON.stringify({ query: 'mutation {createChat(item: { id:"'+ id +'",ChatSessionId: "'+ id +'", Name: "'+ sessionName +'" }){ ChatSessionId } }',
		variables: { }
	}),
        success: function(result) {
            console.log(result.data);
			addChatSessionTile(result.data.createChat.ChatSessionId,sessionName);
			
			if(CurrentSessionId=="undefined" || CurrentSessionId =="")
			{
				loadMessagesInChatSession(result.data.createChat.ChatSessionId,sessionName);
				setActiveChatSessionTile(false);
			}			
			
        }

    });
}


function addMessage( )
{
	
	var sender=document.getElementById('senderInput').value;
	var messageText=document.getElementById('messageInput').value;
	document.getElementById('messageInput').value="";
	var timestamp=new Date().toUTCString();
	var sessionId=CurrentSessionId;
	
	
	if(sender=="" || messageText=="")
	{	
		alert(" Please ensure your Name and Message are not blank.");
		return;
	}
	
	
	var id=generateUUID()
	
	 $.ajax({
        method: 'POST',
        url: graphQL_URL,
        contentType: "application/json",
        async:false,
        data: JSON.stringify({ query: 'mutation {createMessage(item: { id:"'+ id +'",ChatSessionId: "'+ CurrentSessionId +'",DateTime: "'+ timestamp +'",Text: "'+ messageText +'", Sender: "'+ sender +'" }){ ChatSessionId     Text     Sender    DateTime } }',
		variables: { }
	}),
        success: function(result) {
            console.log(result.data);
			
			if(MessagesInCurrentSession==0)
				document.getElementById('chatmessagesdiv').innerHTML ="";
			
			document.getElementById('chatmessagesdiv').innerHTML +=getChatMessageHTML(result.data.createMessage.ChatSessionId,result.data.createMessage.Text,result.data.createMessage.Sender,result.data.createMessage.DateTime);
			MessagesInCurrentSession=MessagesInCurrentSession+1;
			scrollToLastMessage();
        }

    });
}



function loadMessagesInChatSession(sessionId, sessionName)
{
	setActiveChatSessionTile(true);
	CurrentSessionId=sessionId;	
	MessagesInCurrentSession=0;
	
	document.getElementById('chatmessagesdiv').innerHTML = ('<div class="alert alert-info mt-4"><span class="oi oi-data-transfer-download me-2" aria-hidden="true"></span>Please wait while your chat loads.</div>');
	document.getElementById('chatTitle').innerText = ('');
	
	 $.ajax({
        method: 'POST',
        url: graphQL_URL,
        contentType: "application/json",
        async:false,
        data: JSON.stringify({    
		query: '{messages(filter: { ChatSessionId: { eq: "'+ sessionId +'" } }){ items { ChatSessionId     Text     Sender    DateTime }}}',
		variables: { }
	}),
        success: function(result) {
            console.log(result.data);
 
			
			document.getElementById('chatTitle').innerText = (sessionName);			
			
			if(result.data.messages.items.length>0)
			{
				MessagesInCurrentSession=result.data.messages.items.length;
				document.getElementById('chatmessagesdiv').innerHTML ="";
				for (var i = 0; i < result.data.messages.items.length; i++) {
					document.getElementById('chatmessagesdiv').innerHTML +=getChatMessageHTML(sessionId,result.data.messages.items[i].Text,result.data.messages.items[i].Sender,result.data.messages.items[i].DateTime);
					
				}
				scrollToLastMessage();
				

			}
			else
			{
				document.getElementById('chatmessagesdiv').innerHTML = ('<div class="alert alert-info mt-4"><span class="oi oi-envelope-open me-2" aria-hidden="true"></span><span class="text-nowrap">This chat has no messages.</span></div>');
			}
			
			setActiveChatSessionTile(false);
        }

    });
}

function getChatMessageHTML(sessionId, msgText, sender,dateTime)
{
	return ('<p class="text-primary"><b>' + sender +'</b>&nbsp;&nbsp;&nbsp;<span class="small">' + dateTime + '</span><br/> <span>'+ msgText +'</span></p>');
}


function addChatSessionTile(sessionId, sessionName)
{
	document.getElementById('chatsContainer').innerHTML += getChatSessionTileHTML(sessionId, sessionName);
	
	sessionJSON='{"ChatSessionId": "' + sessionId + '", "Name": "' + sessionName + '"}';
	ChatSessions.push(sessionJSON);
				
}

function updateChatSessionTile(sessionId, sessionName)
{
	document.getElementById('chat_'+sessionId).outerHTML = getChatSessionTileHTML(sessionId, sessionName);
	for(i=0;i<ChatSessions.length;i++)
	{
		var obj=JSON.parse(ChatSessions[i]);
		if(obj.ChatSessionId==sessionId)
		{
			obj.Name=sessionName;
			ChatSessions[i]=JSON.stringify(obj);
			return;
		}		
		
	}
}

function setActiveChatSessionTile(clearActive)
{
	for(i=0;i<ChatSessions.length;i++)
	{
		var obj=JSON.parse(ChatSessions[i]);
		var sessionId=obj.ChatSessionId;
		if(clearActive==false)
		{
			if(sessionId==CurrentSessionId)
			{
				document.getElementById('chat_'+sessionId).classList.add('btn-primary');
				document.getElementById('chat_'+sessionId).classList.remove('btn-info');
			}
		}
		else
			if(document.getElementById('chat_'+sessionId).classList.contains('btn-primary'))
			{
				document.getElementById('chat_'+sessionId).classList.add('btn-info');
				document.getElementById('chat_'+sessionId).classList.remove('btn-primary');
			}
	}
	
	
}


function getChatSessionTileHTML(sessionId, sessionName)
{
	return ('<div class="btn btn-info" id="chat_'+ sessionId + '"><div class="w-100 p-1" style="text-align:left " ><a onclick="return handleClick(\'load\',\''+ sessionId +'\',\''+ sessionName +'\');"><span class="oi oi-chat" aria-hidden="true" ></span><span class="px-2" title="'+ sessionName +'" >'+ sessionName +'</span></a></div><div style="text-align:right ;width:100%" ><a onclick="return handleClick(\'rename\',\''+ sessionId +'\',\''+ sessionName +'\');"><i class="bi bi-pencil-fill" ></i> <span class="oi oi-pencil" aria-hidden="true" style="color: white" ></span></a><a onclick="return handleClick(\'delete\',\''+ sessionId +'\',\''+ sessionName +'\');"><span class="oi oi-trash px-2" aria-hidden="true" style="color: white" ></span></a></div></div>');
}

function loadChatSessionTiles()
{
	document.getElementById('chatsContainer').innerHTML = "";
	$.ajax({
        method: 'POST',
        url: graphQL_URL,
        contentType: "application/json",
        async:false,
        data: JSON.stringify({
		query: '{ chats {   items {    ChatSessionId     Name    } }}',
		variables: {}
	}),
        success: function(result) {

            var blnLoaded=false;
			ChatSessions=[];
			for (var i = 0; i < result.data.chats.items.length; i++) {
               
				addChatSessionTile(result.data.chats.items[i].ChatSessionId,result.data.chats.items[i].Name);
				if(CurrentSessionId==result.data.chats.items[i].ChatSessionId)
				{
					loadMessagesInChatSession(result.data.chats.items[i].ChatSessionId,result.data.chats.items[i].Name);
					blnLoaded=true;
				}
				

            }
			
			if(blnLoaded==false  && result.data.chats.items.length>0)
			{
				loadMessagesInChatSession(result.data.chats.items[0].ChatSessionId,result.data.chats.items[0].Name);
			}
			
			if(result.data.chats.items.length==0)
			{
				document.getElementById('chatmessagesdiv').innerHTML = ('<div class="alert alert-info mt-4"> <span class="oi oi-lightbulb me-2" aria-hidden="true"></span> <strong>No Chats Available</strong> <span class="text-nowrap">Use the New Chat option to start a new chat.        </span></div>');
			}
			
		
        }

    });
}


$(document).ready(function() {
    loadChatSessionTiles();
});


function postMessage(ele) {
    if(event.key == 'Enter') {
        addMessage();
    }
}




