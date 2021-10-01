'use strict';

const sqlite = require('sqlite3');
const bcrypt = require('bcrypt');

sqlite.Database.prototype.runAsync = function (sql, ...params) {
    return new Promise((resolve, reject) => {
        this.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
    });
}

const db = new sqlite.Database('survey.db', (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    }
});
db.on("error", function (error) {
    console.log("Getting an error : ", error);
});

const checkUserSidUnpub = 'sId = (SELECT id from surveys WHERE id = ? AND uId = ? AND published = false);';

const addAnswer = async (answer) => {
    try {
        await db.runAsync('BEGIN');
        let query = "INSERT INTO aToQ(sId,name,timestamp) VALUES(?,?, strftime('%Y-%m-%dT%H:%M','now','localtime'));";
        const aId = await db.runAsync(query, answer.sId, answer.name);
        query = 'INSERT INTO answers VALUES ' +
            answer.content.map((a, idx) => {
                    let answ;
                    if(a===null || a===undefined)
                        answ='NULL';
                    else if (Array.isArray(a))
                        answ=`'${JSON.stringify(a)}'`;
                    else if(typeof a ==='number')
                        answ=a;
                    else
                        answ=JSON.stringify(a);
                    return `('${aId}','${idx}',${answ})`
                }
            ).join() + ";";
        await db.runAsync(query);
        db.runAsync('COMMIT');
        return aId;
    } catch (e) {
        db.runAsync('ROLLBACK');
        throw e;
    }
}

const publishSurvey = async (sId, userId) => {
    const query = "UPDATE surveys SET published = strftime('%Y-%m-%dT%H:%M','now','localtime') WHERE id = ? AND uId = ?;";
    await db.runAsync(query, sId, userId);
    return getSurvey(sId,userId);
}


const getSurveyQuestions = (sId, uId=undefined) => {
    return new Promise((res, rej) => {
        const query = 'SELECT q.id as id,q.title as title, required, options from questions q,surveys s WHERE sId=? AND q.sId=s.id '+ (uId>=0 ? `AND uId=${uId} `: 'AND s.published IS NOT NULL ')+'ORDER BY q.id;';
        db.all(query, [sId], (err, rows) => {
            if (err)
                rej(err);
            else if (rows.length === 0)
                res(false)
            else {
                res({sId: parseInt(sId), questions: rows.map(q => ({...q,options:JSON.parse(q.options)}))})

            }
        })
    })
}

const getCompleteSurvey = async (sId) => {
    let res1 = await getSinglePublishedSurvey(sId);
    if(!res1) return false;
    delete res1.id;
    let res2 = await getSurveyQuestions(sId);
    if(!res2) return false;
    return ({...res1, ...res2});
}

const swapQuestionsOrder = (sId, swapOrder, userId) => {
    const query = 'UPDATE questions SET idx = (CASE idx WHEN ' + swapOrder[0] + ' then ' + swapOrder[1] +
        ' WHEN ' + swapOrder[1] + ' THEN ' + swapOrder[0] +
        ' END) WHERE ' + checkUserSidUnpub;
    return db.runAsync(query, sId, userId);
}

const setQuestionsOrder = (sId, newOrder, userId) => {
    const query = 'UPDATE questions SET idx = (CASE id' +
        newOrder.map((val, i) => ' WHEN ' + i + ' then ' + val).join(' ') +
        ' END) WHERE ' + checkUserSidUnpub;
    return db.runAsync(query, sId, userId);
}

const deleteQuestion = (sId, qId, userId) => {
    const query = 'DELETE FROM questions WHERE id = ? AND ' + checkUserSidUnpub;
    return db.runAsync(query, qId, sId, userId);
}

const addSurvey = async (survey, publish, userId) => {
    try {
        await db.runAsync('BEGIN');
        let sId,query;
        if(publish) {
            query = "INSERT INTO surveys(title,uId, published, nQuestions, added) VALUES(?,?,strftime('%Y-%m-%dT%H:%M','now','localtime'),?,strftime('%Y-%m-%dT%H:%M','now','localtime'));";
            sId = await db.runAsync(query, survey.title, userId, survey.questions.length);
        } else {
            query = "INSERT INTO surveys(title,uId, published, nQuestions, added) VALUES(?,?,null,?,strftime('%Y-%m-%dT%H:%M','now','localtime'));";
            sId = await db.runAsync(query, survey.title, userId, survey.questions.length);
        }

        query = 'INSERT INTO questions VALUES ' +
            survey.questions.map((q, idx) =>
                `(${sId},${idx},'${q.title}',${q.required}, ${q.options ? `'${JSON.stringify({min:q.min,max:q.max,values:q.options})}'` : null}, ${idx})`
            ).join() + ";";
        console.log(query)
        await db.runAsync(query);
        db.runAsync('COMMIT');
        return sId;
    } catch (e) {
        console.log(e)
        db.runAsync('ROLLBACK');
        throw e;
    }
}

const deleteSurvey = async (sId, userId) => {
    const query = 'DELETE FROM surveys WHERE id = ? AND uId = ?';
    return db.runAsync(query, sId, userId);
}

const getUser = (email, password) => {
    return new Promise((res, rej) => {
        const query = 'SELECT * FROM users WHERE email = ?;';
        db.get(query, [email], (err, row) => {
            if (err)
                rej(err);
            else if (row === undefined)
                res(false);
            else {
                bcrypt.compare(password, row.password).then(result => {
                    if (result)
                        res({id: row.id, email: row.email, name: row.name});
                    else
                        res(false);
                })
            }
        })
    })
}

const getUserById = (id) => {
    return new Promise((res, rej) => {
        const query = 'SELECT * FROM users WHERE id = ?;';
        db.get(query, [id], (err, row) => {
            if (err)
                rej(err);
            else if (row === undefined)
                res({error: 'User not found.'});
            else
                res({id: row.id, email: row.email, name: row.name});
        })
    })
}

const signUp = (user) => {
    return new Promise((res, rej) => {
        const query = 'INSERT INTO users(email,name,password) VALUES(?,?,?)';
        bcrypt.hash(user.password, 10, function (err, hash) {
            db.run(query, [user.email, user.name, hash], function (err) {
                if (err) {
                    rej(err);
                } else {
                    res(this.lastID);
                }
            })

        })
    })
}

const getAnswersPaged = (sId, userId, start = 0, pageSize = 5, paged = true) => {
    return new Promise((res, rej) => {
        let query = "SELECT aId, name, '{' || group_concat('\"' || qid || '\":' || '\"' || IFNULL(content,'null') || '\"') || '}' as value, timestamp " +
            "FROM aToQ, answers a " +
            "WHERE aToQ.aId = a.id AND aToQ.sId = (SELECT id FROM surveys WHERE id = ? AND uId = ?) " +
            "GROUP BY aId " +
            "ORDER BY a.id , name , qid";
        query += paged ? " LIMIT ?,?;" : ";";

        db.all(query, [sId, userId, start, pageSize], (err, rows) => {
            if (err)
                rej(err);
            else {
                let answers= rows.map(e => {
                    e.value = JSON.parse(e.value)
                    for(const p in e.value)
                        try{
                            e.value[p] = JSON.parse(e.value[p])
                        } catch (e) {}
                    return e;
                })
                res({sId: parseInt(sId), nextStart: (start + rows.length), answers})
            }

        })
    })

}

const getSinglePublishedSurvey = (sId) => {
    return new Promise((res, rej) => {
        const query = 'SELECT s.id,s.title,u.name as author,published FROM surveys s, users u WHERE published IS NOT NULL AND uId=u.id AND s.id=?;';
        db.get(query,[sId],(err, row) => {
            if (err)
                rej(err);
            else if(row === undefined)
                res(false);
            else
                res(row);
        })
    })
}

const getPublishedSurveys = () => {
    return new Promise((res, rej) => {
        const query = 'SELECT s.id,s.title,u.name as author,published,nQuestions FROM surveys s, users u WHERE published IS NOT NULL AND uId=u.id ORDER BY published DESC;';
        db.all(query, (err, rows) => {
            if (err)
                rej(err);
            else if(rows.length===0)
                res(false);
            else
                res(rows);
        })
    })
}

const getAllAuthSurveys = (uId) => {
    return new Promise((res, rej) => {
        const query = "SELECT id, title," +
            "case when uid=? then responses else null end as responses," +
            "case when uid=? then published else null end as published," +
            "case when uid=? then uId else null end as uId " +
            "from surveys;";
        db.all(query, [uId, uId, uId], (err, rows) => {
            if (err)
                rej(err);
            else
                res(rows.reduce((acc, val) => {
                    val.uId === uId ? acc.my.concat(val) : acc.other.concat(val)
                }, {my: [], other: []}));
        })
    });
}

const getMyAuthSurveys = (uId) => {
    return new Promise((res, rej) => {
        const query = "SELECT id, title, responses, published FROM surveys WHERE uId = ? ORDER BY published DESC;";
        db.all(query, [uId], (err, rows) => {
            if (err)
                rej(err);
            else
                res(rows);
        })
    });
}

const getSurvey = (sId, uId) => {
    return new Promise((res,rej) => {
        const query = 'SELECT * FROM surveys WHERE id = ? AND uId = ?;';
        db.get(query,[sId,uId],(err,row) =>{
            if(err)
                rej(err);
            else if(row === undefined)
                res(false);
            else
                res(row);
        })
    })
}



/*
CREATE VIEW Answ (aId, sId, name, timestamp, content) AS SELECT aId, sId, name, json_group_array(qid, content) from aToQ, answers WHERE aId=id
 */
module.exports = {
    getUser, getUserById, signUp,
    addSurvey, addAnswer, deleteSurvey, deleteQuestion,
    getSurveyQuestions, getCompleteSurvey,
    setQuestionsOrder, swapQuestionsOrder,
    publishSurvey, getAnswersPaged, getPublishedSurveys, getAllAuthSurveys, getMyAuthSurveys,
    getSurvey,
};