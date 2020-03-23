'use strict'

function getGameIdFromUrl () {
    let url = window.location.href
    const lastSlash = url.lastIndexOf('/')
    if ( lastSlash != -1 ) {
        // handle local game.html
        if ( url.substr( lastSlash + 1 ) == "game.html" ) {
            return "idmb4t";
        } else {
            return url.substr( lastSlash + 1 )
        }
    } else {
        return null
    }
}

let app = new Vue({
    el: "#app",
    data: {
        gameId: getGameIdFromUrl(),
        gameData: {},
        actions: {},
    },
    methods: {
        getGameData: function () {
            axios.get(`https://utopiaengine.herokuapp.com/g/${ this.gameId }/data`)
            .then( ( res ) => {
                this.gameData = res.data.data;
                console.log('getGameData success');
            })
            .catch( ( err ) => {
                console.error('getGameData error');
            })
            return this.gameData
        },

        getActions: function () {
            axios.get(`https://utopiaengine.herokuapp.com/g/${ this.gameId }/actions`)
            .then( ( res ) => {
                this.actions = res.data.actions;
                console.log('getActions success');
            })
            .catch( ( err ) => {
                console.error('getActions error');
            })
            return this.actions
        },

        doRest: function () {
            console.log("doRest clicked!");
        },

        name: function () {
            console.log('name clicked!');
        },

        onClick: function ( event ) {

        },

        onClick2: function ( event ) {
            console.log('on click 2 target = ' + event.target.id);
        }


    },
    created () {
        this.getGameData();
        this.getActions();
    }
})