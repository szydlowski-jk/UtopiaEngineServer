'use strict'

function getGameIdFromUrl () {
    let url = window.location.href
    const lastSlash = url.lastIndexOf('/')
    if ( lastSlash != -1 ) {
        return url.substr( lastSlash + 1 )
    } else {
        return null
    }
}

let app = new Vue({
    el: "#app",
    data: {
        gameId: getGameIdFromUrl(),
    },
    methods: {
        getData: function () {

        }
    }
})