/**
 * Outputting the last day on which a student was active
 */

var common = require('./common')

const CLEAN_RUN = false

/* INT MAIN */
main()
async function main() {
    console.log("start")
    var cache = null
    var people_arr = null

    if(CLEAN_RUN) {
        cache = common.get_fresh_store()
         
        people_arr = await common.get_people_arr()
        
        
        cache.set('people_arr', people_arr)
    } else {
        cache = common.get_cached_store()
        people_arr = cache.get('people_arr')
    }

    common.assert.exists(people_arr, 'people_arr assert')
    console.log("people_arr count " + Object.keys(people_arr).length)
    console.log("done")
}
/* END INT MAIN */

