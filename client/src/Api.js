const BASEURL = '/api/';

const parseResponse = async (response, callback = undefined) => {
    let resJson;
    try {
        resJson = await response.json();
    } catch (e) {
        resJson = response.statusText;
    }
    if (response.ok)
        return callback ? callback(resJson) : resJson;
    else
        throw resJson;

}

const getPublishedSurveys = async () => {
    let response = await fetch(BASEURL + 'getSurveys');
    return await parseResponse(response);
}

const getAuthSurveys = async () => {
    let response = await fetch(BASEURL + 'survey/my/header');
    return await parseResponse(response);
}

const getAuthSurvey = async (sId) => {
    let response = await fetch(BASEURL + 'survey/' + sId + '/header');
    return await parseResponse(response);
}

const logIn = async (credentials) => {
    return await fetch(BASEURL + 'sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: credentials.email, password: credentials.password}),
    });
}

const logOut = async () => {
    await fetch(BASEURL + 'sessions/current', {method: 'DELETE'});
}

const getUserInfo = async () => {
    return await fetch(BASEURL + 'sessions/current');
}

const getSurveyQuestions = async (sId) => {
    let response = await fetch(BASEURL + 'getSurvey/' + sId + '/questions');
    return await parseResponse(response);
}

const submitSurvey = async (survey, publish) => {
    let response = await fetch(BASEURL + 'insertSurvey', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({survey, publish})
    });
    return await parseResponse(response);
}

const submitAnswer = async (answer) => {
    let response = await fetch(BASEURL + 'insertAnswer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({answer})
    });
    return await parseResponse(response);
}

const publishSurvey = async (sId) => {
    let response = await fetch(BASEURL + 'survey/' + sId + '/publish');
    return await parseResponse(response);
}

const getAuthSurveyQuestions = async (sId) => {
    let response = await fetch(BASEURL + 'survey/' + sId + '/questions');
    return await parseResponse(response);
}

const getAnswers = async (sId, start) => {
    let response = await fetch(BASEURL + 'survey/' + sId + '/answers/' + start);
    return await parseResponse(response);
}

const API = {
    logIn, logOut, getUserInfo, getPublishedSurveys,
    getSurveyQuestions,
    submitSurvey, getAuthSurveys,
    publishSurvey, getAuthSurveyQuestions, submitAnswer,
    getAnswers, getAuthSurvey
};
export default API;