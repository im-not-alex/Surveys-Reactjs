import {useEffect, useState} from "react";
import API from "../../Api";
import {Link} from "react-router-dom";
import {useAuthState} from "../AuthContext";
import NoAuthCard from "./SurveyHeaders";
import {CardColumns} from "react-bootstrap";
import {PageTitleBar} from "../utils";

const initState = {loading: true, list: [], error: null, styleI: []};

const SurveysList = (props) => {
    const auth = useAuthState();
    const [surveys, setSurveys] = useState(initState);
    useEffect(() => {
        if (!auth.isPending) {
            setSurveys(initState);
            API.getPublishedSurveys().then(l => {
                if(l) {
                    let colors=[];
                    for(let j in l)
                        colors[j]=Math.floor(Math.random() * 8);
                    setSurveys({loading: false, list: l, error: null, styleI: colors})
                }
                else setSurveys({...initState,loading: false})
            }).catch(e => ({loading: false, list: [], error: e, styleI: []}))
        }
    }, [auth.user])
    return (
        <div>
            <PageTitleBar title={"Available Surveys"} centerTitle/>

            {
                surveys.loading ? <div>loading</div> : (
                    surveys.list.length>0 ?
                    <CardColumns className={"px-4 pb-4"}>
                        {
                                surveys.list.map((s, index) =>
                                    <NoAuthCard key={"pubS-" + index} survey={s} styleI={surveys.styleI[index]}>
                                        <Link to={"/takeSurvey/" + s.id}>{JSON.stringify(s)}</Link>
                                    </NoAuthCard>)
                        }
                    </CardColumns>
                        : <div className={"text-center font-italic"}><h4>Sorry, there are no published surveys at the moment.</h4></div>

                )
            }
        </div>)

}
export default SurveysList;