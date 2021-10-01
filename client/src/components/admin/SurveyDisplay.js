import {
    Checkbox,
    Container,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Paper,
    Radio,
    RadioGroup,
    TextField
} from "@material-ui/core";
import {HelperText, TitleCard, Wrapper} from "../utils";
import dayjs from "../dayjsUtils";

const NameCard = ({name}) =>
    <Paper className={"question-card"} elevation={3}>
        <div className="question-title">User Name</div>
        <TextField id="compilerName" variant="outlined"
                   fullWidth value={name}
                   multiline margin={"dense"}
                   InputProps={{readOnly: true}}/>
    </Paper>

const openAnswerLength = 200;
const QuestionCard = ({question, value,answer}) => {
    const title = <>{question.title}{" "}{question.required ? <span className={"text-danger "}>*</span> : null}</>;

    const type = question.options ? (question.options.max === 1 ? 'radio' : 'check') : 'open';
    switch (type) {
        case 'open' :
            return (
                <Wrapper title={title}>
                    <TextField id={"question-" + question.id + "-open"}
                               value={value || ""}
                               variant='outlined'
                               placeholder={answer ? null: "Write here your answer..."}
                               required={question.required === 1}
                               fullWidth multiline rows={2}
                               InputProps={{readOnly: true}}
                               rowsMax={8}
                               helperText={answer? null :
                                   <HelperText error={false}
                                               errortext=""
                                               currentsize={value?.length || 0} maxsize={openAnswerLength}/>
                               }/>
                </Wrapper>
            );
        case 'radio':
            value = parseInt(value)
            return (
                <Wrapper title={title}>
                    <FormControl component={"fieldset"} error={false} className={"options-sizing"}>
                        <RadioGroup value={value >= 0 ? value : null}>
                            {
                                question.options.values.map((opt, optIndex) =>
                                    <FormControlLabel
                                        className={"display-option"}
                                        key={"question-" + question.id + "-option-" + optIndex}
                                        control={<Radio/>}
                                        value={optIndex} label={opt}/>
                                )
                            }
                        </RadioGroup>
                    </FormControl>
                </Wrapper>
            );
        case 'check':
            return (
                <Wrapper title={title}>
                    <FormControl component={"fieldset"} error={false} fullWidth>
                        {
                            <FormLabel component="legend" className={"mb-0 legend"}>Number of selections:<br/>
                                <ul>
                                    {question.options.min > 0 && <li>min : {question.options.min}</li>}
                                    <li>max : {question.options.max}</li>
                                </ul>
                            </FormLabel>
                        }
                        <FormGroup className={"options-sizing"}>
                            {
                                question.options.values.map((opt, optIndex) =>
                                    <FormControlLabel
                                        key={"question-" + question.id + "-option-" + optIndex}
                                        className={"display-option"}
                                        control={
                                            <Checkbox checked={value?.includes(optIndex) || false}
                                                      value={optIndex}
                                                      key={"question-" + question.id + "-option-" + optIndex}/>}
                                        label={opt}/>
                                )
                            }
                        </FormGroup>
                    </FormControl>
                </Wrapper>
            );
        default :
            return null;
    }
}

const SurveyDisplay = ({survey, answer}) => {
    return (
        survey &&
        <Container maxWidth={"md"} className={"vertical-list px-0"}>
            <TitleCard title={survey.title}/>
            {answer && <NameCard name={answer.name}/>}
            {
                survey.questions.map((q, index) =>
                    <QuestionCard question={q} key={'question-' + index} value={answer ? answer.value[q.id] : null} answer={answer!==null && answer!==undefined}/>
                )
            }
            {
                answer && <footer className={"text-right font-italic"}>{dayjs(answer.timestamp).format('LLLL')}</footer>
            }
        </Container>
    )
}
export default SurveyDisplay;