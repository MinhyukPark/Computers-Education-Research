/**
 *  File to get bottom N % of students in MP performance
 */

var common = require('./common')

const CLEAN_RUN = true
const N = 70
const T = 70

const MP_ARR = ['MP0', 'MP1', 'MP2', 'MP3', 'MP4']

/* INT MAIN */
main()
async function main() {
    // console.log("start")
    var cache = null
    var active_people_arr = null
    var bottom_n_arr = null
    var freq_arr = null

    if(CLEAN_RUN) {
        cache = common.get_fresh_store()

        active_people_arr = await common.get_active_people_arr()
        bottom_n_arr = await get_bottom_n_arr(active_people_arr)
        freq_arr = await get_freq_arr(bottom_n_arr)
        
         
        cache.set("active_people_arr", active_people_arr)
        cache.set("bottom_n_arr", bottom_n_arr)
        cache.set("freq_arr", freq_arr)
    } else {
        cache = common.get_cached_store()

        active_people_arr = cache.get("active_people_arr")
        bottom_n_arr = cache.get("bottom_n_arr")
        freq_arr = cache.get("freq_arr")
    }
    common.assert.exists(active_people_arr, "active_people_arr assert")
    common.assert.exists(bottom_n_arr, "bottom_n_arr assert")
    common.assert.exists(freq_arr, "freq_arr assert")
    // console.log("active_people_arr count " + Object.keys(active_people_arr).length)
    
    output_freq_arr(freq_arr)

    // console.log("done")
}
/* END INT MAIN */

function output_freq_arr(freq_arr) {
    for (current_email in freq_arr) {
        console.log(current_email)
        console.log(freq_arr[current_email])
    }
}

async function get_freq_arr(bottom_n_arr) {
    freq_arr = {}
    for (current_mp in bottom_n_arr) {
        for (current_email in bottom_n_arr[current_mp]) {
            if(!(current_email in freq_arr)) {
                freq_arr[current_email] = 0
            }
            freq_arr[current_email] += 1
        }
    }
    return Object.keys(freq_arr).filter(function(x) {
        return freq_arr[x] > (MP_ARR.length / 2)
    }).reduce(function(obj, key) {
        obj[key] = freq_arr[key]
        return obj
    }, {})
}

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

    for (cur_mp of MP_ARR) {
        current_mp_arr = []
        for (current_email in active_people_arr) {
            var MPGrades_query = {
                assignment: cur_mp,
                email: current_email,
                'score.best': true
            }

            var MPGrades_project = {
                email: 1,
                'score.adjustedScore': 1
            }

            var MPGrades_sort = {
            }

            var current_arr = await (MPGrades.find(
                MPGrades_query
            ).project(
                MPGrades_project
            ).sort(
                MPGrades_sort
            ).toArray())
            current_mp_arr.push(current_arr)
            common.assert.exists(current_arr, 'current_arr assert')
        }
        current_mp_arr = current_mp_arr.filter(function(x) {
            return x.length > 0
        })

        current_mp_arr.sort(function(a, b) {
            left = a[0]['score']['adjustedScore']
            right = b[0]['score']['adjustedScore'] 
            if(left < right) {
                return -1
            } else if (left > right) {
                return 1
            } else {
                return 0
            }
        })

        bottom_length = current_mp_arr.length * N / 100
        current_mp_arr = current_mp_arr.filter(function(x) {
            return x[0]['score']['adjustedScore'] < T
        })

        if(current_mp_arr.length > bottom_length) {
            current_mp_arr.splice(bottom_length)
        }
        bottom_n_arr[cur_mp] = common._.keyBy(current_mp_arr.flat(), 'email')
    }
    db.close()
    return bottom_n_arr
}
