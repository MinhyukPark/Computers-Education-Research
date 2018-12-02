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
    // console.log("start")
    var cache = null
    var active_people_arr = null
    var available_poins_arr = null
    var components_arr = null

    if(CLEAN_RUN) {
        cache = common.get_fresh_store()
        active_people_arr = await common.get_active_people_arr()
        inactive_people_arr = await common.get_inactive_people_arr()
        components_arr = await get_components_arr()
        // available_points_arr = await get_available_points_arr(active_people_arr, components_arr) 
        available_points_arr = await get_available_points_arr(inactive_people_arr, components_arr) 

        cache.set("active_people_arr", active_people_arr)
        cache.set("inactive_people_arr", inactive_people_arr)
        cache.set("components_arr", components_arr)
        cache.set("available_points_arr", available_points_arr)
    } else {
        cache = common.get_cached_store()
        active_people_arr = cache.get("active_people_arr")
        inactive_people_arr = cache.get("inactive_people_arr")
        components_arr = cache.get("components_arr")
        available_points_arr = cache.get("available_points_arr")
    }
    common.assert.exists(active_people_arr, "active_people_arr assert")
    common.assert.exists(inactive_people_arr, "inactive_people_arr assert")
    common.assert.exists(components_arr, "components_arr assert")
    common.assert.exists(available_points_arr, "available_points_arr assert")
    
    output_available_points_arr(available_points_arr)
    // console.log("active_people_arr count " + Object.keys(active_people_arr).length)
    // console.log("done")
}
/* END INT MAIN */

function output_available_points_arr(available_points_arr) {
    console.log("timestamps")
    for(timestamp of available_points_arr["timestamp"]) {
        console.log(timestamp)
    }
    console.log("class")
    for(class_point of available_points_arr["class"]) {
        console.log(class_point)
    }
    students_arr = Object.keys(available_points_arr["students"])
    for(student of students_arr) {
        console.log(student)
        for(student_point of available_points_arr["students"][student]) {
            console.log(student_point)
        }
    }
}

async function get_available_points_arr(active_people_arr, components_arr) {
    available_points_arr = {} 
    available_points_arr["class"] = []
    available_points_arr["students"] = {}
    available_points_arr["timestamp"] = []

    rand_int = Object.keys(active_people_arr).length
    current_student = Object.keys(active_people_arr)[common.get_rand_int(rand_int)]
    available_points_arr["students"][current_student] = []

    const db = await common.MongoClient.connect(common.constants.LOCAL_URI, {
        useNewUrlParser: true
    })

    common.assert.exists(db, "db assert")
    const root_db = db.db(common.constants.DB_NAME)
    common.assert.exists(root_db, "db assert")

    const bestChanges = root_db.collection("bestChanges")
    common.assert.exists(bestChanges, "bestChanges assert")

    var bestChanges_query = {
        email: current_student
    }

    var bestChanges_project = {}
    for (component of Object.keys(components_arr)) {
        bestChanges_project[component + ".totals.noDrops.percent"] = 1
        bestChanges_project[component + ".totals.noDrops.outOf"] = 1
    }
    bestChanges_project["timestamp"] = 1

    var bestChanges_sort = {
        "timestamp": 1 
    }

    var current_arr = await (bestChanges.find(
        bestChanges_query
    ).project(
        bestChanges_project
    ).sort(
        bestChanges_sort
    ).toArray())
    var truncated_mod = 1 
    var current_mod_count = 0 

    // class
    for (current of current_arr) {
        /* DEBUG TRUNCATION */
        if(current_mod_count % truncated_mod == 0) {
            current_mod_count += 1
        } else {
            current_mod_count += 1
            continue
        }
        /* DEBUG TRUNCATION END */
        var current_percentage_earned = 0
        for (component of Object.keys(components_arr)) {
            if(!(component in current) || current[component]["totals"]["noDrops"] == undefined) {
                continue
            }
            current_component = current[component]["totals"]["noDrops"]
            current_component_expected = components_arr[component]["expectedOutOf"]
            current_component_scale = current_component["outOf"] / current_component_expected
            current_component_scaled = 100 * current_component_scale

            current_component_curve = components_arr[component]["percent"] / 100
            current_component_curved = current_component_scaled * current_component_curve

            current_percentage_earned += current_component_curved
        }
        available_points_arr["class"].push(current_percentage_earned)  
        available_points_arr["timestamp"].push(current["timestamp"])
    }

    // students
    for (current of current_arr) {
        /* DEBUG TRUNCATION */
        if(current_mod_count % truncated_mod == 0) {
            current_mod_count += 1
        } else {
            current_mod_count += 1
            continue
        }
        /* DEBUG TRUNCATION END */
        var current_percentage_earned = 0
        for (component of Object.keys(components_arr)) {
            if(!(component in current) || current[component]["totals"]["noDrops"] == undefined) {
                continue
            }
            current_component = current[component]["totals"]["noDrops"]
            current_component_expected = components_arr[component]["expectedOutOf"]
            current_component_scale = current_component["outOf"] / current_component_expected
            current_component_scaled = current_component["percent"] * current_component_scale

            current_component_curve = components_arr[component]["percent"] / 100
            current_component_curved = current_component_scaled * current_component_curve

            current_percentage_earned += current_component_curved
        }
        available_points_arr["students"][current_student].push(current_percentage_earned)  
    }

    db.close()
    return available_points_arr
}

async function get_components_arr() {
    const db = await common.MongoClient.connect(common.constants.LOCAL_URI, {
        useNewUrlParser: true
    })
    common.assert.exists(db, "db assert")

    const root_db = db.db(common.constants.DB_NAME)
    common.assert.exists(root_db, "db assert")

    const best = root_db.collection("best")
    common.assert.exists(best, "best assert")
    var best_query = {
        "semester": common.constants.CURRENT_SEMESTER
    }

    var best_project = {
        "components": 1,
        "semesterInfo": 1
    }
    
    var best_arr = await (best.find(best_query).project(best_project).limit(1).toArray())

    var key_arr = best_arr[0]["components"]
    var val_arr = best_arr[0]["semesterInfo"] 
    
    var components_arr = {}
    for (key of key_arr) {
       components_arr[key] = {} 
       components_arr[key]["expectedOutOf"] = val_arr["components"][key]["expectedOutOf"]
       components_arr[key]["percent"] = val_arr["components"][key]["percent"]
    }

    db.close()
    return components_arr
}



