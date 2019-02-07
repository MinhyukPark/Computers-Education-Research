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
    console.log("done")


    result = await output_all_students_with_mp1_below_50(active_people_arr)
    for(cur of result) {
        console.log(cur)
    }
}
/* END INT MAIN */

async function output_all_students_with_mp1_below_50(active_people_arr) {
    const db = await common.MongoClient.connect(common.constants.LOCAL_URI, {
        useNewUrlParser: true
    })

    common.assert.exists(db, "db assert")
    const root_db = db.db(common.constants.DB_NAME)
    common.assert.exists(root_db, "db assert")

    const best = root_db.collection('best')
    common.assert.exists(best, 'best assert')

    var best_query = { 
        'MPs.MP0.percent': {
            $lt: 50,
            $ne: 0
        }
    }

    var best_project = {
        email: 1,
        'MPs.MP0.percent': 1
    }
        
    var best_sort = {
    }

    var current_arr = await (best.find(
        best_query
    ).project(
        best_project
    ).sort(
        best_sort
    ).toArray())
    common.assert.exists(current_arr, 'current_arr assert')

    db.close()
    return current_arr

}
