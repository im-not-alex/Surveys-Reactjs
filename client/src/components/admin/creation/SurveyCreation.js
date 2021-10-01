import {useEffect, useReducer, useRef, useState} from "react";
import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fab
} from "@material-ui/core";
import {QuestionCard, TitleCardEdit} from "./Cards";
import {Add as AddIcon} from '@material-ui/icons';
import Question from "../../Question";
import {DragDropContext, Droppable} from "react-beautiful-dnd";
import API from '../../../Api';
import {PageTitleBar} from "../../utils";
import {Link, Redirect} from "react-router-dom";
import {useAuthState} from "../../AuthContext";

const reducer = (state, action) => {
    switch (action.type) {
        case 'add':
            const sz = Math.max(...(state.length ? state.map(s => s.id) : [0])) + 1;
            state = state.concat(new Question(sz));
            action.setFocus('question-' + sz);
            break;
        case 'remove':
            state.splice(action.id, 1);
            break;
        case 'swap':
            [state[action.i], state[action.j]] = [state[action.j], state[action.i]];
            break;
        case'reorder':
            let arr = [...state];
            arr.move(action.from, action.to);
            state = arr;
            break;
        case 'setTitle' :
            state[action.id].title = action.title;
            break;
        case 'setType':
            state[action.id].setType(action.optType);
            break;
        case 'setMin':
            state[action.id].setMin(action.min);
            break;
        case 'setRequired':
            state[action.id].setRequired(action.required);
            break;
        case 'swapOptions':
            state[action.id].swapOptions(action.i, action.j);
            break;
        case 'reorderOptions':
            state[action.id].reorderOptions(action.from, action.to);
            break;
        case 'addOption':
            state[action.id].options = state[action.id].options.concat("");
            break;
        case 'removeOption':
            state[action.id].options.splice(action.index, 1);
            if(state[action.id].max > state[action.id].options.length)
                state[action.id].setMax(state[action.id].options.length)
            if(state[action.id].min > state[action.id].options.length)
                state[action.id].setMin(state[action.id].options.length)
            if(state[action.id].max === 1)
                state[action.id].setType('radio');
                break;
        case 'editOption':
            state[action.id].options[action.index] = action.value;
            break;
        case 'editMin':
            state[action.id].setMin(action.value);
            break;
        case 'editMax':
            state[action.id].setMax(action.value);
            break;
        default:
            break;
    }
    return [...state];

}

const SurveyCreation = (props) => {
    const auth = useAuthState();
    const [title, setTitle] = useState("");
    const [questions, editQuestions] = useReducer(reducer, []);
    const [validated, setValidated] = useState(false);
    const [focus, setFocus] = useState("titleCard");
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const completed = useRef();

    const handleFocus = (id) => {
        setFocus(id);
    }


    const handleTitleSet = e => {
        setTitle(e.target.value)
    };

    const questionHandlers = {
        handleAddQuestion: () => {
            setValidated(false);
            editQuestions({type: 'add', setFocus});
        },
        handleRemoveQuestion: (id) => {
            editQuestions({type: 'remove', id});
        },
        handleQuestionTitleSet: e => {
            const id = parseInt(e.target.attributes.index.value)
            editQuestions({type: 'setTitle', id, title: e.target.value});
        },
        handleQuestionTypeSet: e => {
            editQuestions({type: 'setType', id: e.target.name, optType: e.target.value});
        },
        handleQuestionRequiredSet: e => {
            const id = parseInt(e.target.attributes.index.value)
            editQuestions({type: 'setRequired', id, required: e.currentTarget.checked});
        },
        handleAddOption: (id) => {
            editQuestions({type: 'addOption', id});
        },
        handleRemoveOption: (id, index) => {
            editQuestions({type: 'removeOption', id, index});
        },
        handleEditOption: (id, index, value) => {
            editQuestions({type: 'editOption', id, index, value})
        },
        handleEditMin: (id, value) => {
            editQuestions({type: 'editMin', id, value});
        },
        handleEditMax: (id, value) => {
            editQuestions({type: 'editMax', id, value});
        },
        onOptionDragEnd: (id, result) => {
            if (!result.destination || result.source.index === result.destination.index)
                return;
            editQuestions({type: 'reorderOptions', id, from: result.source.index, to: result.destination.index})
        }
    };

    const onQuestionDragEnd = (result) => {
        if (!result.destination)
            return;
        if (result.source.index === result.destination.index)
            return;
        setFocus("question-"+ questions[result.source.index].id)
        editQuestions({type: 'reorder', from: result.source.index, to: result.destination.index})
    }

    const titleProps = {focus, handleFocus, title, handleTitleSet, validated};

    function handleOnSubmit(event,publish) {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === true) {
            if(questions.length>0)
                setOpenConfirmation(true);
            else alert("need at least one question!")
        } else {
            props.openFeedback("warning","Check out! There are some errors");
            setValidated(true);
        }

    }

    const handleDialogSubmit= () => {
        API.submitSurvey({title, questions}, true)
            .then(res => {
                props.openFeedback("success","Survey successfully published!");
                completed.current.click();})
            .catch(e => {
                console.log(e);
                props.openFeedback("error","Oops, something went wrong...");
            } )
    }

    useEffect(() => {
        setOpenConfirmation(false);
    },[])

    return (
        !auth.isAuthenticated ? <Redirect to={"/login"}/> :

            <form noValidate autoComplete="off" className={"pb-5"} onSubmit={(e) => handleOnSubmit(e,true)}>
                <Link className={"d-none"} to={"/admin"} innerRef={completed}/>
                <PageTitleBar title={"Create New Survey"}
                              options={
                                  <>
{/*                                      <Button size={"large"} className={"btn-link"}
                                              onClick={() => handleOnSubmit(false)}>Save</Button>{" "}*/}
                                      <Button disabled={questions.length===0} type="submit" size={"large"} variant={"contained"} color="primary">Publish</Button></>}/>
                <Dialog
                    open={openConfirmation}
                    onClose={() => setOpenConfirmation(false)}>
                    <DialogTitle>Proceed to Publication?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            After submitting this survey it will be published, becoming public and you will be no longer able to modify it.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenConfirmation(false)} className={"text-danger"}>
                            Go Back
                        </Button>
                        <Button onClick={handleDialogSubmit} color="primary" autoFocus>
                            Publish
                        </Button>
                    </DialogActions>
                </Dialog>
                <Container maxWidth="md" className="vertical-list">
                    <TitleCardEdit {...titleProps}/>
                    <DragDropContext
                        onDragEnd={onQuestionDragEnd}>
                        <Droppable droppableId="questions" type="questions">
                            {(provided, snapshot) => (
                                <div ref={provided.innerRef} className="vertical-list">
                                    {
                                        questions.map((q, index) => (
                                            <QuestionCard {...{
                                                index,
                                                focus,
                                                handleFocus,
                                                question: q,
                                                validated,
                                                handlers: questionHandlers
                                            }} key={"question-" + index}
                                            />
                                        ))
                                    }
                                    {provided.placeholder}

                                </div>)}

                        </Droppable>
                    </DragDropContext>


                    <Fab disabled={questions.length===10} variant="extended" color="secondary" size="large" onClick={questionHandlers.handleAddQuestion}
                         id="add-question">
                        <AddIcon/>
                        Question
                    </Fab>
                </Container>
            </form>


    )
}

export default SurveyCreation;