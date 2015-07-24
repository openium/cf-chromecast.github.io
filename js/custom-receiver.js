var CFFChromeCastJsonObjectType = {
    Unknown       : -1,
    ArticleDetail : 0,
    TypeVideo     : 1
}

var CFFChromeCastApplication = {
    LaMontagne       : 'lamontagne',
    LaRep            : 'larep',
    LeBerry          : 'leberry',
    LEchoRepublicain : 'lechorepublicain',
    LeJDC            : 'lejdc',
    LePopulaire      : 'lepopulaire',
    Lyonne           : 'lyonne'
}

window.onload = function() {
    cast.receiver.logger.setLevelValue(0);
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    console.log('Starting Receiver Manager');

    // handler for the 'ready' event
    castReceiverManager.onReady = function(event) {
        console.log('Received Ready event: ' + JSON.stringify(event.data));
        window.castReceiverManager.setApplicationState("Application status is ready...");
    };

    // handler for 'senderconnected' event
    castReceiverManager.onSenderConnected = function(event) {
        console.log('Received Sender Connected event: ' + event.data);
        console.log(window.castReceiverManager.getSender(event.data).userAgent);
    };

    // handler for 'senderdisconnected' event
    castReceiverManager.onSenderDisconnected = function(event) {
        console.log('Received Sender Disconnected event: ' + event.data);
        if (window.castReceiverManager.getSenders().length == 0) {
            window.close();
        }
    };

    // handler for 'systemvolumechanged' event
    castReceiverManager.onSystemVolumeChanged = function(event) {
        console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' +
        event.data['muted']);
    };

    // create a CastMessageBus to handle messages for a custom namespace
    window.messageBus =
    window.castReceiverManager.getCastMessageBus(
        'urn:x-cast:fr.centrefrance.afpmobile');

    // handler for the CastMessageBus message event
    window.messageBus.onMessage = function(event) {
        console.log('Message [' + event.senderId + ']: ' + event.data);
        // display the message from the sender
         var jsonObject = JSON.parse(event.data)

         switch (jsonObject.type) {
            case CFFChromeCastJsonObjectType.ArticleDetail:
                displayArticle(jsonObject);
               break;
             default:
                displaySplashScreen();
                break;
         }

        // inform all senders on the CastMessageBus of the incoming message event
        // sender message listener will be invoked
        window.messageBus.send(event.senderId, event.data);
    }

    // initialize the CastReceiverManager with an application status message
    window.castReceiverManager.start({statusText: "Application is starting"});
    console.log('Receiver Manager started');
};

function displaySplashScreen(jsonObject) {
    document.getElementById('logo-cf').style.display = 'block';
    document.getElementById('article-container').style.display = 'none';

    window.castReceiverManager.setApplicationState("splashscreen");
}

function clearSlider() {
    document.getElementById("slides").innerHTML = "";

    var div = document.createElement("div");

    div.setAttribute("id", "article-images-container");
    div.setAttribute("class", "slides-container");

    document.getElementById("slides").appendChild(div);
}

var isSliding = false;

function startSlider() {

    if( !isSliding ) {
        isSliding = true;

        $('#slides').superslides({
            animation: 'fade',
            pagination: false,
            play: 4000
        });
    } else {
        $('#slides').superslides('update')
    }
}

function addImageToSlider(element, index, array) {
    var image = document.createElement("img");

    image.setAttribute("src", element);
    image.setAttribute("class", "article-image max-size");

    document.getElementById("article-images-container").appendChild(image);
}

function displayArticle(jsonObject) {
    document.getElementById('logo-cf').style.display = 'none';
    document.getElementById('article-container').style.display = 'block';
    document.getElementById('article-app-icon').style.display = 'block';

    document.getElementById("article-app-icon").src = 'images/' + jsonObject.application + ".png";
    document.getElementById("article-title").innerHTML = jsonObject.title;
    document.getElementById("article-subtitle").innerHTML = jsonObject.subtitle;

    clearSlider();
    jsonObject.images.forEach(addImageToSlider);
    startSlider();

    window.castReceiverManager.setApplicationState(jsonObject.title);
};
