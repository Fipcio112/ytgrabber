const script = document.createElement('script');
script.src = chrome.runtime.getURL('lib/mqttws31.js');
(document.head || document.documentElement).appendChild(script);


// Create a variable to hold the MQTT client object
let client;

// Function to connect to the MQTT broker
function connect() {
    client = new Paho.MQTT.Client("localhost", 8883, "myclientid");
    client.connect({ onSuccess: onConnect, onFailure: onFailure });
}

function onConnect() {
    console.log('Connected to MQTT broker');
}

function onFailure(message) {
    console.error('Failed to connect to MQTT broker: ', message);
}

function init() {
    connect();
    const titleElement = document.querySelector("#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.content-info-wrapper.style-scope.ytmusic-player-bar > yt-formatted-string");
   // const artistElement = document.querySelector("#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.content-info-wrapper.style-scope.ytmusic-player-bar > span > span.subtitle.style-scope.ytmusic-player-bar > yt-formatted-string")
    const imgElement = document.querySelector("#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.thumbnail-image-wrapper.style-scope.ytmusic-player-bar > img");
    debugger;
    if (titleElement || timeElement || imgElement) {
        const observer = new MutationObserver((mutationsList, observer) => {
            var title = titleElement.innerText.trim();
            var imgSrc = imgElement.src;
         //   const artist = artistElement.title;
         //   console.log(artist);
            // Publish the new data to the MQTT broker
            if (client && client.isConnected()) {
                const titleMessage = new Paho.MQTT.Message(title);
                titleMessage.destinationName = 'hasp/plate/command/p1b2.text';
                client.send(titleMessage);
               // const artistMessage = new Paho.MQTT.Message(artist);
             //   titleMessage.destinationName = 'hasp/plate/command/p1b3.text';
             //   client.send(artistMessage);
                
                var hq1 = imgSrc.substring(0, imgSrc.indexOf('?'));
                var regexhi = /^https?:\/\/[^\/]+\/vi\/[^\/]+\//;
                try {
                    const hq2 = hq1.match(regexhi)[0];
                    const hq = hq2 + "maxresdefault.jpg";

                    fetch(hq, { method: 'HEAD' })
                        .then(response => {
                            console.log(response.status);
                            if (response.status == 200) {
                                sendimgquality("Hi  ", "http://10.0.0.10:3001/?url=" + hq);
                                let link = ("https://soczek.aloes/?url=" + hq);
                                fetch(link, { method: 'POST' });
                                imgSrc = "";
                                response = 404;
                            }
                        })
                }
                catch (err) {

                    try {
                        const videoId = imgSrc.match(/\/vi\/(.*)\//)[1];
                        var medUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        fetch(medUrl, { method: 'HEAD' })
                            .then(response => {
                                console.log(response.status);
                                if (response.status == 200) {
                                    sendimgquality("Med  ", "http://10.0.0.10:3001/?url=" + medUrl);
                                    let link = ("https://soczek.aloes/?url=" + medUrl)
                                    fetch(link, { method: 'POST' });
                                    imgSrc = "";
                                    response = 404;
                                }
                            })
                    }
                    catch (err) {

                        try {
                            const regexlow = /^(.+)=.+$/;
                            var lowUrl = imgSrc.replace(regexlow, '$1');
                            fetch(lowUrl, { method: 'HEAD' })
                                .then(response => {
                                    console.log(response.status);
                                    if (response.status == 200) {
                                        sendimgquality("Low  ", "http://10.0.0.10:3001/?url=" + lowUrl + "=w300-h300");
                                        let link = ("https://soczek.aloes/?url=" + lowUrl + "=w300-h300");
                                        fetch(link, { method: 'POST' });
                                        imgSrc = "";
                                        response = 404;
                                    }
                                })
                        }
                        catch (err) { }
                    }
                }
                //console.log("Title = " + title + '\n' + "   imgSrc = " + imgSrc + '\n' + "hq   " + hq + '\n' + "hq1   " + hq1 + '\n' + "hq2   " + hq2 + '\n' + "medUrl   " + medUrl + '\n' + "lowUrl   " + lowUrl + '\n\n\n\n\n\n');

            }
        });

        observer.observe(titleElement, { characterData: true, childList: true });
        observer.observe(imgElement, { attributes: true });
        
    }


    function sendimgquality(quality, url) {
        const imgMessage = new Paho.MQTT.Message(url);
        const imgQuality = new Paho.MQTT.Message(quality);
        imgMessage.destinationName = 'hasp/plate/command/p1b4.text';
        imgQuality.destinationName = 'hasp/plate/command/p1b5.text';
        client.send(imgMessage);
        client.send(imgQuality);
        console.log(quality + "   " + url);
        return;
    }

    setInterval(() => {

        var timeElement = document.querySelector("#left-controls > span");
        var slider = document.querySelector("#progress-bar")
        var time = timeElement.innerText.trim();
        var slidernow = slider.getAttribute('aria-valuenow');
        var slidermin = slider.getAttribute('aria-valuemin');
        var slidermax = slider.getAttribute('aria-valuemax');

        if (client && client.isConnected()) {

            const timeMessage = new Paho.MQTT.Message(time);
            timeMessage.destinationName = 'hasp/plate/command/p1b1.text';
            client.send(timeMessage);

            const slidernowMessage = new Paho.MQTT.Message(slidernow.toString());
            slidernowMessage.destinationName = 'hasp/plate/command/p1b4.val';
            client.send(slidernowMessage);

            const slidermaxMessage = new Paho.MQTT.Message(slidermax.toString());
            slidermaxMessage.destinationName = 'hasp/plate/command/p1b4.max';
            client.send(slidermaxMessage);

            const sliderminMessage = new Paho.MQTT.Message(slidermin.toString());
            sliderminMessage.destinationName = 'hasp/plate/command/p1b4.min';
            client.send(sliderminMessage);
        }
    }, 100);
}
init();