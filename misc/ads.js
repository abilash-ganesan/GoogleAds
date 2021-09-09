"use strict"

//ad variables
var videoelement;
var adContainer;
var adDisplayContainer;
var adsLoader;
var adsManager;
var countdownTimer;
var playbutton;

// Response TYPE
const RESPONSE_TYPE = {
    POST: 'POST',
    GET: 'GET'
};

// Ads API Response
var adsAPIresponse = null;

//API Endpoints
const scoreAPIEndpoint = 'https://stg-api-games.sonyliv.com/score-api';
const adsAPIEndpoint = 'https://stg-api-games.sonyliv.com/manage_ads/index_v2/';

// Content Type
const contentType = 'application/x-www-form-urlencoded';

//score data for API
var userid = "15151515999"; // Random user ID
var gameid = "193"; //Might change from time to time
var score = "65"; // Random Score

// To check if the ad api is initialized
var adsAPIInitialized = false;

function submitScore() {
    postScoreAPIRequest(userid, gameid, score);
};

// XHR request to POST score
function postScoreAPIRequest(_user_id, _game_id, _score) {
    let postData = "user_id=" + _user_id + "&game_id=" + _game_id + "&action_id=SCORE" + "&score=" + _score;

    let xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
            if (this.status === 200) {
                console.log("Post Score");
                console.log(this.responseText)
            }
        }
    });

    xhr.open(RESPONSE_TYPE.POST, scoreAPIEndpoint);
    xhr.setRequestHeader('content-type', contentType);

    xhr.send(postData);
};



// XHR request to get Ad responce
function initializedAdAPIRequest() {
    if (adsAPIInitialized) {
        console.log("API Already Initialized");
        return;
    }

    console.log("Initialized Ad API");

    let xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
            if (this.status === 200) {
                adsAPIresponse = JSON.parse(this.responseText)
                console.log(this.responseText)
                console.log(adsAPIresponse)


                adsAPIresponse.start_game = function () { };

                adsAPIresponse.in_game = function () { };

                adsAPIresponse.revive = function () {  };

                adsAPIresponse.reward = function () { };

                adsAPIresponse.exit = function () { };
            }
            adsAPIInitialized = true;
            adsAPIresponse.revive = playAds();
        }
    });

    xhr.open(RESPONSE_TYPE.GET, adsAPIEndpoint + gameid);
    xhr.setRequestHeader('content-type', contentType);

    xhr.send();
};

function init() {
    videoelement = document.getElementById('video-element');
    setUpIMA();
}

function setUpIMA() {
    // Create the ad display container.
    createAdDisplayContainer();
    // Create ads loader.
    adsLoader = new google.ima.AdsLoader(adDisplayContainer);
    // Listen and respond to ads loaded and error events.
    adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        onAdsManagerLoaded, false);
    adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

    // An event listener to tell the SDK that our content video
    // is completed so the SDK can play any post-roll ads.
    var contentEndedListener = function () {
        adsLoader.contentComplete();
    };
    videoelement.onended = contentEndedListener;

    // Request video ads.
    var adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
        'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
        'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
        'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    adsRequest.linearAdSlotWidth = 640;
    adsRequest.linearAdSlotHeight = 400;

    adsRequest.nonLinearAdSlotWidth = 640;
    adsRequest.nonLinearAdSlotHeight = 150;

    adsLoader.requestAds(adsRequest);
}
function createAdDisplayContainer() {
    // We assume the adContainer is the DOM id of the element that will house
    // the ads.
    adDisplayContainer = new google.ima.AdDisplayContainer(
        document.getElementById('adContainer'), videoelement);
}

function playAds() {
    // Initialize the container. Must be done via a user action on mobile devices.
    videoelement.load();
    adDisplayContainer.initialize();

    try {
        // Initialize the ads manager. Ad rules playlist will start at this time.
        adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
        // Call play to start showing the ad. Single video and overlay ads will
        // start at this time; the call will be ignored for ad rules.
        adsManager.start();
    } catch (adError) {
        // An error may be thrown if there was a problem with the VAST response.
        videoelement.play();
    }
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
    // Get the ads manager.
    var adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    // videoelement should be set to the content video element.
    adsManager =
        adsManagerLoadedEvent.getAdsManager(videoelement, adsRenderingSettings);

    // Add listeners to the required events.
    adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        onContentResumeRequested);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED, onAdEvent);

    // Listen to any additional events, if necessary.
    adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdEvent);
    adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, onAdEvent);
    adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, onAdEvent);
}

function onAdEvent(adEvent) {
    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.
    var ad = adEvent.getAd();
    switch (adEvent.type) {
        case google.ima.AdEvent.Type.LOADED:
            // This is the first event sent for an ad - it is possible to
            // determine whether the ad is a video ad or an overlay.
            if (!ad.isLinear()) {
                // Position AdDisplayContainer correctly for overlay.
                // Use ad.width and ad.height.
                videoelement.play();
            }
            break;
        case google.ima.AdEvent.Type.STARTED:
            // This event indicates the ad has started - the video player
            // can adjust the UI, for example display a pause button and
            // remaining time.
            if (ad.isLinear()) {
                // For a linear ad, a timer can be started to poll for
                // the remaining time.
                intervalTimer = setInterval(
                    function () {
                        var remainingTime = adsManager.getRemainingTime();
                    },
                    300);  // every 300ms
            }
            break;
        case google.ima.AdEvent.Type.COMPLETE:
            // This event indicates the ad has finished - the video player
            // can perform appropriate UI actions, such as removing the timer for
            // remaining time detection.
            if (ad.isLinear()) {
                clearInterval(intervalTimer);
            }
            break;
    }
}

function onAdError(adErrorEvent) {
    // Handle the error logging.
    console.log(adErrorEvent.getError());
    adsManager.destroy();
}

function onContentPauseRequested() {
    videoelement.pause();
    // This function is where you should setup UI for showing ads (e.g.
    // display ad timer countdown, disable seeking etc.)
    //setupUIForAds();
}

function onContentResumeRequested() {
    videoelement.play();
    // This function is where you should ensure that your UI is ready
    // to play content. It is the responsibility of the Publisher to
    // implement this function when necessary.
    //setupUIForContent();
}

// Wire UI element references and UI event listeners.
init();