var MODE = 'state_mode'

function state_mode() {
    document.getElementById('state').classList.add('active');
    document.getElementById('cluster').classList.remove('active');
    MODE = 'state_mode'
    // console.log(MODE)
    hoverdCountry = 'mean';
    updateNetworkChart(MODE)
    updateRadarChart(MODE)
    updateBarChart(MODE)
    infoState = 'open';
    info_mode()
    // insightState = 'open';
    // insight_mode()
    // var insightButton = document.getElementById('insight');
    // if (!insightButton.hidden) {
    //     insightButton.hidden = true;
    // }
}

function cluster_mode() {
    document.getElementById('state').classList.remove('active');
    document.getElementById('cluster').classList.add('active');
    MODE = 'cluster_mode'
    // console.log(MODE)
    updateNetworkChart(MODE)
    updateRadarChart(MODE)
    updateBarChart(MODE)
    infoState = 'open';
    info_mode()
    // insightState = 'open';
    // insight_mode()
    // var insightButton = document.getElementById('insight');
    // if (insightButton.hidden) {
    //     insightButton.hidden = false;
    // }
}