'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session');
const fs = require('fs');
const secret = fs.readFileSync('./secret', 'utf8');
const {body, param, validationResult} = require('express-validator'); // validation middleware
const db = require('./dbAPI');

//PASSPORT
passport.use(new LocalStrategy(
    function (email, password, done) {
        db.getUser(email, password).then((user) => {
            if (!user)
                return done(null, false, {message: 'Incorrect email/password combination.'});
            return done(null, user);
        })
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.getUserById(id)
        .then(user => {
            done(null, user); // this will be available in req.user
        }).catch(err => {
        done(err, null);
    });
});

const getObjFromPath = (path, source, depth) => {
    const tree = path.split(/[\.\[\]]/).filter(x => x);
    for (let i = 0; i < depth; i++) {
        source = source[tree[i]];
    }
    return source;
}

// init express
const app = new express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json());

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false
}));
const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        console.log(errors)
        res.status(400).json({errors: errors.array()});
    };
};

const surveyValidator = [
    body('survey', 'Survey must not be EMPTY!').isObject(),
    body('survey.title', 'Survey must have a TITLE!').notEmpty(),
    body('survey.questions', 'Survey needs at least one question!').isArray({min: 1}),
    body('survey.questions.*.title', 'Each question needs a title!').notEmpty(),
    body('survey.questions.*.required', 'Each question needs required specification!').customSanitizer((c, {
        path,
        req
    }) => {
        let father = getObjFromPath(path, req.body, 3);
        if(father.options ===undefined || father.options===null) {
            return c;
        } else {
            return father.min>0;
        }
    }).isBoolean(),
    body('survey.questions.*', 'Options constraints validation failed!').custom(q => {
        if(q.options ===undefined || q.options===null)
            return true;
        else {
            return q.min >= 0 && q.min <= q.max && q.max <= q.options.length && q.max>0 && q.options.length>0;
        }
    }),
    body('survey.questions.*.options.*','Options strings cannot be empty!').notEmpty()
];

const answHeadValidator = [
    body('answer', 'Answer must not be EMPTY!').isObject(),
    body('answer.name').notEmpty(),
    body('answer.sId').isInt()]

const answValidator = async (req, res, next) => {
    try {
        const surveySchema = (await db.getSurveyQuestions(req.body.answer.sId)).questions;
        if (surveySchema) {
            let i = 0;
            await Promise.all([body('answer.content', 'Answers schema do not match survey!').isArray({
                min: surveySchema.length,
                max: surveySchema.length
            }).run(req),
                body('answer.content.*')
                    .custom(a => {
                        let q = surveySchema[i++];
                        if (q.options) {
                            if(a ===null)
                                return q.options.min===0;
                            if(q.options.max>1) {
                                if (q.options.min <= a.length && a.length <= q.options.max) {
                                    let range = [...q.options.values.keys()]
                                    return a.every(v => range.includes(v))
                                } else return false;
                            } else if([...q.options.values.keys()].includes(a)) {
                                return true;
                            } else
                                return false;
                        } else {
                            return ((!q.required && !a) || (a && a.length <= 200))
                        }
                    }).run(req)]);
            const errors = validationResult(req);
            if (errors.isEmpty()) {
                return next();
            }

            res.status(400).json({errors: errors.array()});

        } else res.status(400).json(surveySchema);
    } catch (e) {
        res.status(500).json({errors: e});
    }
}


app.use(passport.initialize());
app.use(passport.session());

const urlWithAuth = ['insertSurvey', 'survey']
const urlNoAuth = ['insertAnswer','getSurveys','sessions'] //DEBUG

app.use((req, res, next) => {
    if(urlWithAuth.some(p => RegExp("^/api/"+p+".*").test(req.path)) && !req.isAuthenticated())
        return res.status(401).json({error: 'not authenticated'});
    else
        return next();

})

app.post('/api/insertSurvey', validate([...surveyValidator, body('publish').isBoolean()]), async (req, res) => {
    db.addSurvey(req.body.survey,req.body.publish, req.user.id).then((c) => res.json(c)).catch(e => console.log(e) || res.status(500).json(e));
})

app.post('/api/insertAnswer', validate(answHeadValidator), answValidator, async (req, res) => {
    db.addAnswer(req.body.answer).then((c) => res.json(c)).catch(e => console.log(e) || res.status(500).json(e));
})

app.get('/api/survey/:sId/publish', validate([param('sId').isInt({min: 0})]), (req, res) => {
    db.publishSurvey(req.params.sId, req.user.id).then((c) => res.json(c)).catch(e => console.log(e) || res.status(500).json(e));
})

app.patch('/api/survey/:sId/setOrder',
    validate([param('sId').isInt({min: 0}), body('order').isArray(), body('oder.*').isInt({min: 0})]),
    (req, res) => {
        db.setQuestionsOrder(req.params.sId, req.body.order, req.user.id).then((c) => res.json(c)).catch(e => console.log(e) || res.status(500).json(e));
    });

app.patch('/api/survey/:sId/swapOrder',
    validate([param('sId').isInt({min: 0}), body('order').isArray({min: 2, max: 2}), body('oder.*').isInt({min: 0})]),
    (req, res) => {
        db.swapQuestionsOrder(req.params.sId, req.body.order, req.user.id).then((c) => res.json(c)).catch(e => console.log(e) || res.status(500).json(e));
    });

app.delete('/api/survey/:sId/questions/:qId',
    validate([param('sId').isInt({min: 0}), param('qId').isInt({min: 0})]),
    (req, res) => {
        db.deleteQuestion(req.params.sId, req.params.qId, req.user.id).then((c) => res.json(c)).catch(e => console.log(e) || res.status(500).json(e));
    });

app.delete('/api/survey/:sId',
    validate([param('sId').isInt({min: 0})]),
    (req, res) => {
        db.deleteSurvey(req.params.sId, req.user.id).then((c) => res.json(c)).catch(e => console.log(e) || res.status(500).json(e));
    });

app.get('/api/survey/:sId/answers/:start?',
    validate([param('sId').isInt({min: 0}), param('start').optional().customSanitizer(s => s || 0).isInt({min: 0})]),
    (req, res) => {
        db.getAnswersPaged(req.params.sId, req.user.id, parseInt(req.params.start)).then((c) => res.json(c)).catch(e => console.log(e) || res.status(500).json(e));
    });

app.get('/api/survey/:sId/header',
    (req, res) => {
        let dbRes ;
        switch (req.params.sId) {
            case 'my':
                dbRes = db.getMyAuthSurveys(req.user.id);
                break;
            case 'all':
                dbRes = db.getAllAuthSurveys(req.user.id);
                break;
            default :
                dbRes = db.getSurvey(req.params.sId, req.user.id);
        }
        dbRes.then((c) => res.json(c)).catch(e => console.log(e) || res.status(500).json(e));
    });

app.get('/api/survey/:sId/questions', validate([param('sId').isInt({min:0})]), (req,res) => {
    db.getSurveyQuestions(req.params.sId,req.user.id).then((c) => res.json(c)).catch(e => console.log(e) || res.status(500).json(e));
})
app.get("/api/getSurveys/", (req,res) => {
    db.getPublishedSurveys().then((c) => res.json(c)).catch(e => console.log(e) || res.status(500).json(e));
})

app.get("/api/getSurvey/:sId/questions", param('sId').isInt({min:0}), (req,res) => {
    db.getCompleteSurvey(req.params.sId).then((c) => res.json(c)).catch(e => console.log(e) || res.status(500).json(e));
})

app.post('/api/sessions', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            // display wrong login messages
            return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
            if (err)
                return next(err);
            return res.json(req.user);
        });
    })(req, res, next);
});
// DELETE /sessions/current
// logout
app.delete('/api/sessions/current', (req, res) => {
    req.logout();
    res.end();
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else
        res.status(401).json({message: 'Unauthenticated user!'});
});


const signUp = async () => {
    try {
        const res = await db.signUp({email:"mario.rossi@polito.it",name: "Mario Rossi",password: "password"});
        console.log(res);
    } catch(e) {
        console.log(e)
    }
}

// activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    //signUp();
});



