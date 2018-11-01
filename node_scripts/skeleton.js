/**
 * (Skeleton file for basic javascript)
 */

var common = require('./common')

const CLEAN_RUN = false

/* INT MAIN */
main()
async function main() {
    console.log("start")
    var cache = null
    var active_people_arr = null

    if(CLEAN_RUN) {
        cache = common.get_fresh_store()
        active_people_arr = await common.get_active_people_arr()
        cache.set("active_people_arr", active_people_arr)
    } else {
        cache = common.get_cached_store()
        active_people_arr = cache.get("active_people_arr")
    }
    common.assert.exists(active_people_arr, "active_people_arr assert")
    console.log("active_people_arr count " + Object.keys(active_people_arr).length)
    console.log("done")
}
/* END INT MAIN */
