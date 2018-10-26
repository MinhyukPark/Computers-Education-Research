/**
 * Outputting the last day on which a student was active
 */

var common = require('./common')

const CLEAN_RUN = false

/* INT MAIN */
main()
async function main() {
    // console.log("start")
    var cache = null
    var inactive_people_arr = null
    var inactive_intellij_arr = null

    if(CLEAN_RUN) {
        cache = common.get_fresh_store()
         
        inactive_people_arr = await common.get_inactive_people_arr()
        inactive_intellij_arr = await common.get_intellij_arr(inactive_people_arr)
        inactive_progress_arr = await common.get_progress_arr(inactive_people_arr)
        
        
        cache.set('inactive_people_arr', inactive_people_arr)
        cache.set('inactive_intellij_arr', inactive_intellij_arr)
        cache.set('inactive_progress_arr', inactive_progress_arr)
    } else {
        cache = common.get_cached_store()
        inactive_people_arr = cache.get('inactive_people_arr')
        inactive_intellij_arr = cache.get('inactive_intellij_arr')
        inactive_progress_arr = cache.get('inactive_progress_arr')
    }

    common.assert.exists(inactive_people_arr, 'inactive_people_arr assert')
    common.assert.exists(inactive_intellij_arr, 'inactive_intellij_arr assert')
    common.assert.exists(inactive_progress_arr, 'inactive_progress_arr assert')
    // console.log("inactive_people_arr count " + Object.keys(inactive_people_arr).length)
    // console.log("inactive_intellij_arr count " + Object.keys(inactive_intellij_arr).length)
    // console.log("inactive_progress_arr count " + Object.keys(inactive_progress_arr).length)

    last_active_date_arr = await get_last_active_date(inactive_progress_arr)
    display_last_active_date_arr(last_active_date_arr)
    
    // console.log("done")
}
/* END INT MAIN */

function display_last_active_date_arr(last_active_date_arr) {
    for (current_email in last_active_date_arr) {
        if(!(last_active_date_arr[current_email] == -1)) {
            // console.log(current_email + " :  " + common.moment(last_active_date_arr[current_email]).format("YYYY-MM-DD hh:mm a"))
            console.log(current_email)
            console.log(last_active_date_arr[current_email])
        }
    }
}

async function get_last_active_date(inactive_progress_arr) {
    last_active_date_arr = {}
    for (current_email in inactive_progress_arr) {
        last_active_date_arr[current_email] = -1
        current_arr = inactive_progress_arr[current_email].reverse()
        if(current_arr.length < 1) {
            continue
        }
        var previous_timestamp = current_arr[0]['timestamp']
        for (current_entry of current_arr) {
            var current_timestamp = current_entry['timestamp']
            if(current_timestamp < previous_timestamp &&
               previous_timestamp - current_timestamp < common.constants.TWO_DAYS) {
                last_active_date_arr[current_email] = previous_timestamp
                break
            } else {
                previous_timestamp = current_timestamp
            }
        }
    }            
    return last_active_date_arr
}
