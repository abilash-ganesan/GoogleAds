var videoElement;
var adContainer;
var adDisplayContainer;
var adsLoader;
var adsManager;
var countdownTimer;
var playButton;

// Define a variable to track whether there are ads loaded and initially set it to false
var adsLoaded = false;

window.addEventListener('load', function () {
    videoElement = document.getElementById('video-element');
    playButton = document.getElementById('play-button');
    initializeIMA();
    videoElement.addEventListener('play', function (event) {
        LoadAds(event);
    })

    playButton.addEventListener('click', function () {
        PlayAds();
    });
});

window.addEventListener('resize', function () {
    console.log("window resized");
    if (adsManager) {
        var width = videoElement.clientWidth;
        var height = videoElement.clientHeight;
        adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
    }
});

function initializeIMA() {
    console.log("initializing IMA");
    adContainer = document.getElementById('ad-container');
    adContainer.addEventListener('click', AdContainerClick);
    adDisplayContainer = new google.ima.AdDisplayContainer(videoElement, adContainer);
    adsLoader = new google.ima.AdsLoader(adDisplayContainer);



    adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        OnAdsManagerLoaded,
        false);

    adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        OnAdError,
        false);

    // Let the AdsLoader know when the video has ended
    videoElement.addEventListener('ended', function () {
        adsLoader.contentComplete();
    });



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

    // Pass the request to the adsLoader to request ads
    adsLoader.requestAds(adsRequest);

    console.log("initialized IMA");

}

function AdContainerClick() {
    console.log("ad container clicked");
    if (videoElement.paused) {
        videoElement.play();
    }
    else {
        videoElement.pause();
    }
}

function OnAdsManagerLoaded(adsManagerLoadedEvent) {
    var adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

    // Instantiate the AdsManager from the adsLoader response and pass it the video element
    adsManager = adsManagerLoadedEvent.getAdsManager(videoElement, adsRenderingSettings);

    adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR, OnAdError);

    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        OnContentPauseRequested);

    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        OnContentResumeRequested);

    adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, OnAdLoaded);
}

function OnAdLoaded(adEvent) {
    var ad = adEvent.getAd();
    if (!ad.isLinear()) {
        videoElement.play()
    }
}

function OnAdError(adErrorEvent) {
    // Handle the error logging.
    console.log(adErrorEvent.getError());
    if (adsManager) {
        adsManager.destroy();
    }
}

function OnContentPauseRequested() {
    videoElement.pause();
}

function OnContentResumeRequested() {
    videoElement.resume();
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
}

function LoadAds(event) {
    // Prevent this function from running on if there are already ads loaded
    if (adsLoaded) {
        return;
    }
    adsLoaded = true;

    // Prevent triggering immediate playback when ads are loading
    event.preventDefault();

    console.log("loading ads");

    // Initialize the container. Must be done via a user action on mobile devices.

}

function PlayAds() {
    videoElement.load();
    adDisplayContainer.initialize();


    var width = videoElement.clientWidth;
    var height = videoElement.clientHeight;

    try {
        adsManager.init(width, height, google.ima.ViewMode.NORMAL);
        adsManager.start();
    }
    catch (adError) {
        // Play the video without ads, if an error occurs
        console.log("AdsManager Could not be started");
        videoElement.play();
    }
}

function OnAdsStarted(adEvent) {
    countdownTimer = setInterval(function () {
        var timeRemaining = adsManager.getRemainingTime();
        //update UI with timeRemaining
    }, 1000);
}
