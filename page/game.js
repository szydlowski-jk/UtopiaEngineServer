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
        gameData: null,
    },
    methods: {
        getGameData: function () {
            axios.get(`/g/${ this.gameId }/data`)
            .then( ( res ) => {
                this.gameData = res.data
                console.log('getGameData success');
            })
            .catch( ( err ) => {
                console.error('getGameData error');
            })
            return this.gameData
        }
    },
    created () {
        getGameData();
    }
})