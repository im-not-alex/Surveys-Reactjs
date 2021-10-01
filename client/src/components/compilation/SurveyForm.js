import {useEffect, useRef, useState} from "react";
import API from "../../Api";
import {NameCard, QuestionCard} from "./Cards";
import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@material-ui/core";
import {PageTitleBar, TitleCard} from "../utils";
import {Link} from "react-router-dom";

const SurveyForm = (props) => {
    const sId = props.match.params.sId;
    const [survey, setSurvey] = useState({loading: true, value: null, error: null})
    const [answers, setAnswers] = useState([]);
    const [name, setName] = useState("");
    const [validated, setValidated] = useState(false);
    const completed = useRef();
    useEffect(() => {
        API.getSurveyQuestions(props.match.params.sId).then(s => {
            if (s)
                setSurvey({loading: false, value: s, error: null})

        }).catch(e => console.log(e))
    }, [])

    function validateAnswers() {
        let res = name.length > 0;
        res = res && survey.value.questions.every((q) => {
            if (!q.options)
                return q.required ? answers[q.id]?.length > 0 : true;
            else if (q.options.max === 1)
                return q.required ? answers[q.id] >= 0 : true;
            else
                return answers[q.id] ? (answers[q.id].length >= q.options.min && answers[q.id].length <= q.options.max) : !q.required;
        })
        return res;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() && validateAnswers()) {

            setOpenConfirmation(true);
        } else {
            props.openFeedback("warning","Check out! There are some errors");
            setValidated(true);
        }
    };

    const handleNameChange = (e) => setName(e.target.value);

    function handleValueChange(e, type, id) {
        switch (type) {
            case 'check':
                let chk = parseInt(e.target.value);
                setAnswers(a => {
                    let current = a[id];
                    if (current) {
                        if (e.target.checked)
                            current.push(chk);
                        else {
                            let i = current.indexOf(chk);
                            if (i > -1)
                                current.splice(i, 1);
                        }
                    } else {
                        current = [chk];
                    }
                    a[id] = current;
                    return [...a];
                })
                break;
            case 'radio':
                let rad = parseInt(e.target.value);
                setAnswers(a => {
                    let res = [...a];
                    if (res[id] === rad)
                        res[id] = undefined;
                    else
                        res[id] = rad;
                    return res;
                })
                break;
            case 'open':
                setAnswers(a => {
                    let res = [...a];
                    res[id] = e.target.value;
                    return res;
                })
                break;
        }


    }
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const handleDialogSubmit= () => {
        let finalAnswer = [...answers];
        for (let i in survey.value.questions)
            finalAnswer[i] = answers[i];
        API.submitAnswer({
            name: name,
            sId: survey.value.sId,
            content: finalAnswer
        }).then(res => {
            props.openFeedback("success","Answer successfully submitted!");
            completed.current.click()
        }).catch(e => {
            console.log(e);
            props.openFeedback("error","Oops, something went wrong...");
        } )
    }
    return (
        <div>
            <Link className={"d-none"} to={"/"} innerRef={completed}/>
            <Dialog
                open={openConfirmation}
                onClose={() => setOpenConfirmation(false)}>
                <DialogTitle>Proceed sending the Response?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {
                            openConfirmation ? (
                            (answers.length === 0 || answers.filter(a => a===null || a===undefined || a==="").length===answers.length) ?
                                <><span className={"text-danger font-italic"}>Attention! Are you sure sending a BLANK response?</span><br/></> : null ) : null
                        }
                        After sending it, it will not be possible to modify it and will be visible to the administrator.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmation(false)} className={"text-danger"}>
                        Go Back
                    </Button>
                    <Button onClick={handleDialogSubmit} color="primary" autoFocus>
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
            {
                survey.loading ?
                    <>{sId}</> :
                    <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                        <PageTitleBar title={"Take Survey"}
                                      options={<Button type={"submit"} size={"large"} variant={"contained"}
                                                       color="primary">Submit</Button>}/>
                        <Container maxWidth="md" className="vertical-list">
                            <TitleCard title={survey.value.title}/>
                            <NameCard name={name} onChange={handleNameChange} validated={validated}/>
                            {
                                survey.value.questions.map((q, index) => {
                                    const type = q.options ? (q.options.max === 1 ? 'radio' : 'check') : 'open';
                                    return (
                                        <QuestionCard question={q} key={'question-' + index} value={answers[q.id]}
                                                      onChange={(e) => handleValueChange(e, type, q.id)}
                                                      name={"question-" + index}
                                                      validated={validated}/>
                                    )
                                })
                            }
                        </Container>
                    </form>

            }
        </div>

    )
}

export default SurveyForm;