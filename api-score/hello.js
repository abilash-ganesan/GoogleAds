const app = document.getElementById('root')

var request = new XMLHttpRequest()

request.open('POST', 'https://stg-api-games.sonyliv.com/score-api', true)

request.onLoad = function () {
    if (request.status == 200) {
        action_id = SCORE
        user_id = 090217397887858790394
        game_id = GAME_2
        score = 50
    }
}
request.send()