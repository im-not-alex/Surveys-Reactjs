import {Swiper, SwiperSlide} from "swiper/react";
// import Swiper core and required modules
import SwiperCore, {EffectCoverflow, History, Navigation, Pagination} from 'swiper/core';
import "swiper/swiper.min.css";
import "swiper/components/pagination/pagination.min.css"
import "./swiperStyle.css";
import {useEffect, useState} from "react";
import {useAuthState} from "../AuthContext";
import API from "../../Api";
import SurveyDisplay from "./SurveyDisplay";
import {Redirect, useLocation} from "react-router-dom";
import {PageTitleBar} from "../utils";

// install Swiper modules
SwiperCore.use([EffectCoverflow, Navigation, History, Pagination]);

const initState = {loading: true, list: [], survey: {}, error: null};
const AnswerDisplay = (props) => {
    const auth = useAuthState();
    const location = useLocation();
    const [nextStart,setNextStart] = useState(0)
    const [answers, setAnswers] = useState(location.state?.survey ? {
        ...initState,
        survey: location.state.survey
    } : initState);
    useEffect(() => {
        let q, s;
        if (!auth.isPending) {
            if (location.state?.survey)
                API.getAnswers(props.match.params.sId, nextStart).then(r => {
                    setAnswers(a => ({...a, loading: false, list: r.answers, error: null}));
                    setNextStart(r.nextStart)
                }).catch(e => console.log(e))
            else
                API.getAuthSurvey(props.match.params.sId).then((survey) => {
                    s = survey;
                    return API.getAuthSurveyQuestions(props.match.params.sId);
                }).then(({questions}) => {
                    q = questions;
                    return API.getAnswers(props.match.params.sId, nextStart)
                })
                    .then(r => {
                        setAnswers(a => ({loading: false, list: r.answers, survey: {...s, questions: q}, error: null}));
                        setNextStart(r.nextStart)
                    })
                    .catch(e => console.log(e))
        }
    }, [])

    function loadMore() {
        if (answers.list.length>1)
            API.getAnswers(props.match.params.sId, nextStart).then(r => {
                setAnswers(a => ({...a, list: a.list.concat(r.answers)}));
                setNextStart(r.nextStart)
            }).catch(e => console.log(e))
    }

    return (
        !auth.isAuthenticated ? <Redirect to={"/login"}/> :

            <>
                <PageTitleBar title={"Answers"} centerTitle/>

                <div className={"px-3"}>
                    {!answers.loading &&
                    <Swiper
                        onReachEnd={(e) => loadMore()}
                        pagination={{
                            "dynamicBullets": true
                        }}
                        history={{
                            key: "answer",
                            replaceState: true
                        }}>
                        {
                            answers.list.map((a, index) =>
                                <SwiperSlide key={'answer-' + index} data-history={"" + a.aId}>
                                <SurveyDisplay survey={answers.survey} answer={a}/>
                            </SwiperSlide>)
                        }
                    </Swiper>}
                </div>
            </>
    );
}

export default AnswerDisplay;