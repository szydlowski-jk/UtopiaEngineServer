'use strict'

const CONSTS = {
    GODSHAND_COST: 3,
    MAX_GODSHAND_ENERGY: 6,
    GODSHAND_ZERO_SEARCH_BONUS: 5,
    MAX_HP: 6,
    MAX_COMPONENTS: 4,
}

const EVENT_DAYS = [2, 5, 8, 11, 14, 17, 20]

const LOCATIONS = [
    'Workshop',
    'Halebeard Peak',
    'The Great Wilds',
    'Root Strangled Marshes',
    'Glassrock Canyon',
    'Ruined City',
    'The Fiery Maw'
]

const MONSTER_CHART = [
    [[1, 5], [1, 6], [2, 6], [3, 6], [4, 6]],
    [[2, 5], [1, 6], [1, 6], [3, 5], [4, 6]],
    [[1, 5], [2, 6], [2, 6], [3, 6], [4, 6]],
    [[1, 5], [1, 6], [2, 6], [3, 6], [4, 6]],
    [[1, 5], [2, 6], [2, 6], [3, 6], [4, 6]],
    [[1, 5], [2, 5], [3, 5], [3, 6], [4, 6]],
]

const SEARCH_TIMES = [
    [1, 1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0, 0],
    [1, 1, 0, 1, 0, 0],
]

const STATES = {
    IDLE:               'idle',
    SEARCH:             'search',
    COMBAT:             'combat',
    ACTIVATION:         'activation',
    CONNECT:            'connect',
    FINAL_ACTIVATION:   'final_activation',
    GAME_OVER:          'game_over',
    UNCONSCIOUS:        'unconscious',
}

const ACTIONS = {
    REST:               'doRest',
    RECOVER:            'recover',
    SEARCH:             'doSearch',
    GODSHAND:           'useGodsHand',

    /* SEARCH */
    SEARCH_INPUT:       'doSearchInput',
    SEARCH_FINALIZE:    'doSearchFinalize',

    /* COMBAT */
    COMBAT_START:       'doStartCombat',
    COMBAT_ROLL:        'doCombatRoll',
    COMBAT_RESULT:      'doCombatResult',

}

const CONSTRUCT_STATE = {
    NOT_FOUND:  0,
    FOUND:      1,
    ACTIVATED:  2,
    USED:       3,
}

// Use those?
// const MESSAGES = {
//     OK: 'OK',
//     SEARCH_STATE: 'Cannot Search in this state',

// }

const SEARCH_STATES = {
    INPUT: 'input',
    PRERESULT: 'preresult',
}

const COMBAT_STATES = {
    CAN_EVADE:       'can_evade',
    BEFORE_ROLL:     'combat_before_roll',
    BEFORE_RESOLVE:  'combat_before_resolve'
}


function MakeCheckResult (result, valid_values, message) {
    return {
        result: result,
        values: valid_values,
        msg: message
    }
}

class UtopiaData {
    constructor () {
        this.state = STATES.IDLE
        this.substate = null

        this.score = 0

        this.dices = [0, 0]

        /* Search */
        this.location = 0
        this.searchDay = 0
        this.events = [-1, -1, -1, -1]
        this.searchTable = [0, 0, 0, 0, 0, 0]
        this.searchResult = null

        /* combat */
        this.combatLevel = 0

        /* live */
        this.hp = CONSTS.MAX_HP
        this.unconscious = false

        /* time track */
        this.daysPassed = 0
        this.doomsday = 15
        this.godshand = 0
        this.godshandCharges = 8

        /* Inventory */
        this.constructs = [
            CONSTRUCT_STATE.NOT_FOUND,
            CONSTRUCT_STATE.NOT_FOUND,
            CONSTRUCT_STATE.NOT_FOUND,
            CONSTRUCT_STATE.NOT_FOUND,
            CONSTRUCT_STATE.NOT_FOUND,
            CONSTRUCT_STATE.NOT_FOUND,
        ]
        this.components = [0, 0, 0, 0, 0, 0]
        this.treasure = [0, 0, 0, 0, 0, 0]

        this.tools = [1, 1, 1]
    }
}

class UtopiaEngine {
    constructor (data) {
        this.data = data || new UtopiaData
        this.checks = []
        this.actions = []

        //#region REST
        this.checks[ACTIONS.REST] = () => {
            if (this.data.state != STATES.IDLE) {
                return MakeCheckResult(false, [], 'Cannot REST when in ' + this.data.state)
            }

            return MakeCheckResult( true, [], '' )
        }

        this.actions[ACTIONS.REST] = () => {
            if (this.data.hp < CONSTS.MAX_HP) {
                this.data.hp += 1
            }

            this.progressTime()
            return true
        }
        //#endregion REST

        //#region RECOVER
        this.checks[ACTIONS.RECOVER] = () => {
            if ( this.data.state != STATES.UNCONSCIOUS ) {
                return MakeCheckResult( false, [], 'Not UNCONSCIOUS')
            }

            return MakeCheckResult( true, [], '' )
        }

        this.actions[ACTIONS.RECOVER] = () => {
            let daysToRecover = 6
            if ( this.data.constructs[3-1] == CONSTRUCT_STATE.ACTIVATED ) {
                daysToRecover = 4
            }

            for ( let i = 0; i < daysToRecover; i++ ) {
                this.progressTime()
            }

            this.data.hp = 6
            this.data.state = STATES.IDLE
            this.data.substate = null
            this.data.location = 0
            return true
        }
        //#endregion RECOVER


        //#region SEARCH
        this.checks[ACTIONS.SEARCH] = () => {
            if (this.data.state == STATES.IDLE) {
                return MakeCheckResult(true,{ location: [1,2,3,4,5,6] }, '')
            } else {
                return MakeCheckResult(false, [], 'Cannot start SEARCH when in ' + this.data.state)
            }
        }

        this.actions[ACTIONS.SEARCH] = (params) => {
            let location = params.location
            if (this.data.location != location) {
                this.data.location = location
                this.data.searchDay = 0
            }

            if ( SEARCH_TIMES[this.data.location][this.data.searchDay] == 1 ) {
                this.progressTime()
            }

            this.data.searchDay += 1

            this.data.searchTable = [0, 0, 0, 0, 0, 0]

            this.data.state = STATES.SEARCH
            this.data.substate = SEARCH_STATES.INPUT

            this.data.dices[0] = this.RollD6()
            this.data.dices[1] = this.RollD6()
            return true
        }
        //#endregion SEARCH

        //#region SEARCH_INPUT
        this.checks[ACTIONS.SEARCH_INPUT] = () => {
            if (this.data.state != STATES.SEARCH) {
                return MakeCheckResult( false, {}, 'Not in SEARCH' )
            }

            if (this.data.substate != SEARCH_STATES.INPUT) {
                return MakeCheckResult( false, {}, 'Cannot input while in ' + this.data.state + '.' + this.data.substate)
            }

            /* check valid input */
            let values = {}
            values.field = []

            for( let i = 0; i < 6; i++) {
                if ( this.data.searchTable[i] == 0) {
                    values.field.push(i)
                }
            }

            values.dice = []
            for( let i = 0; i < 2; i++) {
                if ( this.data.dices[i] != 0) {
                    values.dice.push(i)
                }
            }

            return MakeCheckResult(true, values, '')
        }

        this.actions[ACTIONS.SEARCH_INPUT] = (params) => {
            this.data.searchTable[params.field] = this.data.dices[params.dice]
            this.data.dices[params.dice] = 0

            let tableNotCompleted = this.data.searchTable.includes(0)

            if (tableNotCompleted) {
                if ( this.data.dices[0] == 0 && this.data.dices[1] == 0) {
                    this.data.dices[0] = this.RollD6()
                    this.data.dices[1] = this.RollD6()
                }
            } else {
                this.data.substate = SEARCH_STATES.PRERESULT
                const up = this.data.searchTable[0] * 100 +
                           this.data.searchTable[1] * 10 +
                           this.data.searchTable[2]
                const down = this.data.searchTable[3] * 100 +
                             this.data.searchTable[4] * 10 +
                             this.data.searchTable[5]
                this.data.searchResult = up - down
            }

            return true
        }
        //#endregion SEARCH_INPUT

        //#region SEARCH_FINALIZE
        this.checks[ACTIONS.SEARCH_FINALIZE] = () => {
            if (this.data.state != STATES.SEARCH) {
                return MakeCheckResult(false, [], 'Not in SEARCH')
            }

            if (this.data.substate != SEARCH_STATES.PRERESULT) {
                return MakeCheckResult(false, [], 'SEARCH not finished')
            }

            return MakeCheckResult(true, [], '')
        }

        this.actions[ACTIONS.SEARCH_FINALIZE] = () => {
            let result = this.data.searchResult
            if ( result < 0 ) {
                result = (-result) + 99
            }

            if ( result >= 100 ) {
                this.data.combatLevel = Math.floor( result / 100 )
                this.data.state = STATES.COMBAT

                this.data.substate = COMBAT_STATES.BEFORE_ROLL

                if ( this.data.treasure[3-1] == 1 ) {
                    this.data.substate = COMBAT_STATES.CAN_EVADE
                }
            } else {
                if ( result > 10 ) {
                    /* found component */
                    this.addComponent()
                } else if ( result >= 0 ) {
                    if ( this.data.constructs[this.data.location-1] == CONSTRUCT_STATE.NOT_FOUND ) {
                        if ( result > 0 ) {
                            this.data.constructs[this.data.location-1] = CONSTRUCT_STATE.FOUND
                        } else {
                            this.data.constructs[this.data.location-1] = CONSTRUCT_STATE.ACTIVATED
                            this.addGodshandEnergy(CONSTS.GODSHAND_ZERO_SEARCH_BONUS)
                        }
                    }
                }

                this.data.state = STATES.IDLE
                this.data.substate = null
            }
        }
        //#endregion SEARCH_FINALIZE


        //#region COMBAT_START
        this.checks[ACTIONS.COMBAT_START] = (params) => {
            if ( this.data.state != STATES.COMBAT ) {
                return MakeCheckResult( false, [], 'Not in COMBAT' )
            }

            if ( this.data.substate != COMBAT_STATES.CAN_EVADE ) {
                return MakeCheckResult( false, [], 'Cannot evade COMBAT' )
            }

            if ( this.data.treasure[3-1] == 0 ) {
                return MakeCheckResult( false, [], 'You don\'t have Shimmering Moonlace')
            }

            return MakeCheckResult( true, [], '' )
        }

        this.actions[ACTIONS.COMBAT_START] = (params) => {
            this.data.state = STATES.IDLE
            this.data.substate = null
            return true
        }
        //#endregion COMBAT_START

        //#region COMBAT_ROLL
        this.checks[ACTIONS.COMBAT_ROLL] = (params) => {
            if ( this.data.state != STATES.COMBAT ) {
                return MakeCheckResult( false, [], 'Not in COMBAT' )
            }

            if (this.data.substate != COMBAT_STATES.BEFORE_ROLL ) {
                return MakeCheckResult( false, [], 'Not Waiting for COMBAT roll' )
            }

            return MakeCheckResult( true, [], '' )
        }

        this.actions[ACTIONS.COMBAT_ROLL] = (params) => {
            this.data.dices[0] = this.RollD6()
            this.data.dices[1] = this.RollD6()
            this.data.substate = COMBAT_STATES.BEFORE_RESOLVE
        }
        //#endregion COMBAT_ROLL

        //#region COMBAT_RESULT
        this.checks[ACTIONS.COMBAT_RESULT] = (params) => {
            if ( this.data.state != STATES.COMBAT ) {
                return MakeCheckResult( false, [], 'Not in COMBAT' )
            }

            if (this.data.substate != COMBAT_STATES.BEFORE_RESOLVE ) {
                return MakeCheckResult( false, [], 'Not waiting for COMBAT result' )
            }

            return MakeCheckResult( true, [], '' )
        }

        this.actions[ACTIONS.COMBAT_RESULT] = (params) => {
            let atk = MONSTER_CHART[this.data.location-1][this.data.combatLevel-1][0]
            let hit = MONSTER_CHART[this.data.location-1][this.data.combatLevel-1][1]

            if ( this.data.dices[0] >= hit || this.data.dices[1] >= hit ) {
                if ( this.RollD6() <= this.data.combatLevel ) {
                    if ( this.data.combatLevel == 5 ) {
                        this.addTreasure()
                    } else {
                        this.addComponent()
                    }
                }

                this.data.state = STATES.IDLE
                this.data.substate = null
                this.data.combatLevel = 0
            } else {
                this.data.substate = COMBAT_STATES.BEFORE_ROLL
            }

            if ( this.data.dices[0] <= atk ) {
                this.takeDamage()
            }

            if ( this.data.dices[1] <= atk ) {
                this.takeDamage()
            }

            return true
        }
        //#endregion COMBAT_RESULT


        //#region GODSHAND
        this.checks[ACTIONS.GODSHAND] = (params) => {
            if (this.data.godshand <= CONSTS.GODSHAND_COST) {
                return MakeCheckResult(false, {}, 'Not enough God\'s Hand energy (required more than ' + CONSTS.GODSHAND_COST + ')')
            }

            if (this.data.godshandCharges == 0) {
                return MakeCheckResult(false, {}, 'All God\'s Hand charges used')
            }

            return MakeCheckResult(true, {}, '')
        }

        this.actions[ACTIONS.GODSHAND] = (params) => {
            this.data.godshand -= 3
            this.data.godshandCharges -= 1
            this.data.doomsday += 1
            return true
        }
        //#endregion GODSHAND
    }


    //#region API
    getAvailableActions () {
        let result = []
        for (const action in this.actions) {
            const check = this.checkAction(action)
            if ( check.result == true ) {
                result[check.action] = check.values
            }
        }
        return result
    }

    getActions () {
        let result = []
        for (const action in this.actions) {
                result.push( this.checkAction( action ) )
        }

        return result
    }

    checkAction (action) {
        let result = MakeCheckResult(false, [], 'Invalid action <' + action + '>')
        if (this.checks[action]) {
            result = this.checks[action]()
        }
        result.action = action
        return result
    }

    doAction (action, params) {
        let check = this.checkAction(action)
        if (check.result == false) {
            return check
        }

        let validParams = true
        let invalidParams = []
        for (const key in params) {
            if (check.values[key] == null || check.values[key].includes(params[key]) == false) {
                invalidParams.push(key)
                validParams = false
            }
        }

        if (validParams == false) {
            return {result: false, action: action, msg: 'Invalid parameters <' + invalidParams + '>' }
        }

        return {result: this.actions[action](params), action: action}
    }
    //#endregion API

    //#region INTERNAL METHODS
    addComponent () {
        if ( this.data.components[this.data.location-1] < CONSTS.MAX_COMPONENTS ) {
            this.data.components[this.data.location-1] += 1
        }
    }

    addTreasure () {
        if ( this.data.treasure[this.data.location-1] == 0 ) {
            this.data.treasure[this.data.location-1] = 1
        }
    }

    takeDamage () {
        this.data.hp -= 1
        if ( this.data.hp == 0 ) {
            this.data.state = STATES.UNCONSCIOUS
            this.data.location = 0
        }
    }

    addGodshandEnergy( energy ) {
        this.data.godshand += energy
        if ( this.data.godshand > CONSTS.MAX_GODSHAND_ENERGY ) {
            this.data.godshand = CONSTS.MAX_GODSHAND_ENERGY
        }
    }

    progressTime () {
        this.data.daysPassed += 1

        if (this.data.daysPassed == this.data.doomsday) {
            this.Doomsday()
        }

        if (EVENT_DAYS.includes(this.data.daysPassed)) {
            this.ShuffleEvents()
        }

        // TODO Add handling of Bracelet of Ios and Scale of Infinity Wurm
    }

    ShuffleEvents() {
        for (let i = 0; i < 4; i++) {
            this.data.events[i] = this.RollD6()
        }
    }

    Doomsday () {
        this.data.state = STATES.GAME_OVER
        // TODO handle game over
    }

    RollD6 () {
        return Math.floor(Math.random() * 6) + 1;
    }
    //#endregion INTERNAL METHODS

}

/* test functions */
function testCombat(ue, location, level, canEvade) {
    ue.data.location = location
    ue.data.combatLevel = level
    ue.data.state = STATES.COMBAT

    if ( canEvade == true ) {
        ue.data.treasure[3-1] = 1
        ue.data.substate = COMBAT_STATES.CAN_EVADE
    } else {
        ue.data.substate = COMBAT_STATES.BEFORE_ROLL
    }
}

let ue = new UtopiaEngine

// ue.doAction(ACTIONS.SEARCH, {location: 3})
// ue.doAction(ACTIONS.SEARCH_INPUT, {field: 0, dice: 0})
// ue.doAction(ACTIONS.SEARCH_INPUT, {field: 1, dice: 1})
// ue.doAction(ACTIONS.SEARCH_INPUT, {field: 2, dice: 0})
// ue.doAction(ACTIONS.SEARCH_INPUT, {field: 3, dice: 1})
// ue.doAction(ACTIONS.SEARCH_INPUT, {field: 4, dice: 0})
// ue.doAction(ACTIONS.SEARCH_INPUT, {field: 5, dice: 1})
// console.log(ue.data.searchTable);
// console.log("---")
// console.log(ue.data.searchResult)
// ue.doAction(ACTIONS.SEARCH_FINALIZE)
// console.log(ue.data.state)
// console.log(ue.data.substate)
// console.log("---")
// console.log(ue.getAvailableActions())

// async function postData(url = '', data = {}) {
//     // Default options are marked with *
//     const response = await fetch(url, {
//       method: 'POST', // *GET, POST, PUT, DELETE, etc.
//       mode: 'no-cors', // no-cors, *cors, same-origin
//       cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//       credentials: 'same-origin', // include, *same-origin, omit
//       headers: {
//         'Content-Type': 'application/json'
//         // 'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       redirect: 'follow', // manual, *follow, error
//       referrerPolicy: 'no-referrer', // no-referrer, *client
//       body: JSON.stringify(data) // body data type must match "Content-Type" header
//     });
//     return await response.json(); // parses JSON response into native JavaScript objects
// }

// postData('https://utopiaengine.herokuapp.com/API', { answer: 42 })
// .then((data) => {
//     console.log(data); // JSON data parsed by `response.json()` call
// });


fetch('https://utopiaengine.herokuapp.com/API', {
  method: 'POST', // or 'PUT'
  mode: 'no-cors', // no-cors, *cors, same-origin
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({action: 'doRest', param: {}}),
})
.then((response) => response.text() )
.then((data) => {
    data = data ? JSON.parse(data) : {}
      console.log('Success:', data);
})
.catch((error) => {
  console.error('Error:', error)
});

//module.exports = new UtopiaEngine()
