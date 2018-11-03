/**
 *  file to get bottom N % of students in MP performance
 */

var common = require('./common')

const CLEAN_RUN = true
const N = 30

/* INT MAIN */
main()
async function main() {
    console.log("start")
    var cache = null
    var active_people_arr = null
    var bottom_n_arr = null

    if(CLEAN_RUN) {
        cache = common.get_fresh_store()
        active_people_arr = await common.get_active_people_arr()
        bottom_n_arr = await get_bottom_n_arr(active_people_arr)
        
         
        cache.set("active_people_arr", active_people_arr)
        cache.set("bottom_n_arr", bottom_n_arr)
    } else {
        cache = common.get_cached_store()
        active_people_arr = cache.get("active_people_arr")
        bottom_n_arr = cache.get("bottom_n_arr")
    }
    common.assert.exists(active_people_arr, "active_people_arr assert")
    common.assert.exists(bottom_n_arr, "bottom_n_arr assert")
    console.log("active_people_arr count " + Object.keys(active_people_arr).length)
    


    console.log("done")
}
/* END INT MAIN */

async function get_bottom_n_arr(active_people_arr) {
    const db = await common.MongoClient.connect(common.constants.LOCAL_URI, {
        useNewUrlParser: true
    })
    common.assert.exists(db, "db assert")
    const root_db = db.db(common.constants.DB_NAME)
    common.assert.exists(root_db, "db_assert")
    const MPGrades = root_db.collection("MPGrades")
    common.assert.exists(MPGrades, "MPGrades assert")
    
    bottom_n_arr = {}
    mp_arr = ['MP0', 'MP1', 'MP2', 'MP3', 'MP4']
    for (cur_mp in mp_arr) {
        var MPGrades_query = {
            assignment: cur_mp
        }

        var MPGrades_project = {
            email: 1,
            'scoring.adjustedScore': 1
        }

        var MPGrades_sort = {
            'scoring.adjustedScore': 1
        }

        var current_arr = await (MPGrades.find(
            MPGrades_query
        ).project(
            MPGrades_project
        ).sort(
            MPGrades.sort
        ).toArray())
        common.assert.exists(current_arr, 'current_arr assert')
       
        console.log(current_arr)
        db.close() 
    }
}
