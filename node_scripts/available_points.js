/**
 * (Skeleton file for basic javascript)
 */

var common = require('./common')

const CLEAN_RUN = true
// timestamp
// semesterInfo
//  -- components
//      -- MPs
//          -- percent: "40"
//      -- quizzes
//      ...
//      -- ...
// components -> array ['lectures', 'extra', 'homework', 'quizzes', 'MPs', 'labs', 'exams']
//
// quizzes
//  -- totals
//      -- withDrops
//          -- percent
// MPs
//  -- totals
//      -- withDrops
//          -- percent
// labs
//  -- totals
//      -- withDrops
//          --percent
// exams
//  -- totals
//      -- noDrops
//          -- percent
// lectures
//  -- totals
//      -- withDrops
//          -- percent
// homework
//  -- totals
//      -- withDrops
//          -- percent
// extra
//  -- totals
//      -- noDrops
//          -- percent
/* INT MAIN */
main()
async function main() {
    console.log("start")
    var cache = null
    var active_people_arr = null

    if(CLEAN_RUN) {
        cache = common.get_fresh_store()
        active_people_arr = await common.get_active_people_arr()
        available_points_arr = await get_available_points_arr(active_people_arr) 

        cache.set("active_people_arr", active_people_arr)
        cache.set("available_points_arr", available_points_arr)
    } else {
        cache = common.get_cached_store()
        active_people_arr = cache.get("active_people_arr")
        available_points_arr = cache.get("available_points_arr")
    }
    common.assert.exists(active_people_arr, "active_people_arr assert")
    common.assert.exists(available_points_arr, "available_points_arr assert")
    console.log("active_people_arr count " + Object.keys(active_people_arr).length)
    console.log("done")
}
/* END INT MAIN */

async function get_available_points_arr(active_people_arr) {
    available_points_arr = {} 
    rand_int = Object.keys(active_people_arr).length
    current_student = Object.keys(active_people_arr)[common.get_rand_int(rand_int)]
    console.log(current_student)
    
    return available_points_arr
}
