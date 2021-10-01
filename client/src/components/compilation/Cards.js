import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
    Paper,
    Radio,
    RadioGroup,
    TextField,
} from "@material-ui/core";
import {HelperText, Wrapper} from "../utils";
import {useState} from "react";


const openAnswerLength = 200;
const QuestionCard = ({question, value, onChange, validated,name}) => {
    const [localV, setLocalV] = useState(false);
    let err = (localV || validated === true);
    const type = question.options ? (question.options.max === 1 ? 'radio' : 'check') : 'open';

    const title = <>{question.title}{" "}{question.required ? <span className={"text-danger "}>*</span> : null}</>;

    const handleBlur = (e) => {
        setTimeout(() =>
            setLocalV(true), 300)

    }

    switch (type) {
        case 'open' :
            err = err && question.required === 1 && !value;
            return (
                <Wrapper title={title} required={question.required}>
                    <TextField id={"question-" + question.id + "-open"}
                               value={value || ""} onChange={onChange} variant='outlined'
                               placeholder={"Write here your answer..."}
                               error={err}
                               name={name}
                               required={question.required === 1}
                               onBlur={() => setLocalV(true)}
                               inputProps={{maxLength: openAnswerLength}}
                               fullWidth multiline rows={2}
                               rowsMax={8}
                               helperText={
                                   <HelperText error={err}
                                               errortext="An answer to this question is required"
                                               currentsize={value?.length || 0} maxsize={openAnswerLength}/>
                               }/>
                </Wrapper>
            );
        case 'radio':
            err = err && question.required === 1 && value===undefined;
            return (
                <Wrapper title={title} required={question.required}>
                    <FormControl component={"fieldset"} error={err} className={"options-sizing"} name={name}>
                        <RadioGroup value={value >= 0 ? value : null}>
                            {
                                question.options.values.map((opt, optIndex) =>
                                    <FormControlLabel
                                        className={"display-option"}
                                        key={"question-" + question.id + "-option-" + optIndex}
                                        control={<Radio onClick={onChange}/>}
                                        value={optIndex} label={opt}/>
                                )
                            }
                        </RadioGroup>
                        <FormHelperText className={err ? "visible" : "invisible"}>You are required to make a choice!</FormHelperText>
                    </FormControl>
                </Wrapper>
            );
        case 'check':
            err = err && ((question.required === 1 && (!value || value?.length === 0)) || value?.length < question.options.min);
            let errMsg = "You are required to provide at least " + (question.options.min === 1 ? "a choice!" : (question.options.min + " choices!"));
            return (
                <Wrapper title={title} onBlur={handleBlur} required={question.required}>
                    <FormControl component={"fieldset"} error={err} fullWidth name={name}>
                        {
                            <FormLabel component="legend" className={"mb-0 legend"}>Number of selections:<br/>
                                <ul>
                                    {question.options.min > 0 && <li>min : {question.options.min}</li>}
                                    <li>max : {question.options.max}</li>
                                </ul>
                            </FormLabel>
                        }
                        <FormGroup onChange={onChange} className={"options-sizing"}>
                            {
                                question.options.values.map((opt, optIndex) =>
                                    <FormControlLabel
                                        key={"question-" + question.id + "-option-" + optIndex}
                                        className={"display-option"}
                                        control={
                                            <Checkbox checked={value?.includes(optIndex) || false}
                                                      disabled={value && !value.includes(optIndex) && value.length === question.options.max}
                                                      value={optIndex}
                                                      key={"question-" + question.id + "-option-" + optIndex}/>}
                                        label={opt}/>
                                )
                            }
                        </FormGroup>
                        <FormHelperText className={err ? "visible" : "invisible"}>{errMsg}</FormHelperText>
                    </FormControl>
                </Wrapper>
            );
        default :
            return null;
    }
}


const nameSize = 50;
const NameCard = ({name, onChange, validated}) => {
    const [localV, setLocalV] = useState(false);
    let err = (localV || validated === true) && !name;
    return (
        <Paper className={"question-card"} elevation={3}>
            <div className="question-title">Please provide your name <span className={"text-danger "}>*</span></div>
            <TextField id="compilerName" required variant="outlined"
                       fullWidth value={name} onChange={onChange}
                       onBlur={() => setLocalV(true)}
                       placeholder="Insert here your name"
                       margin={"dense"}
                       autoFocus
                       helperText={<HelperText error={err}
                                               errortext="Any name is ok, just do it.."
                                               currentsize={name.length} maxsize={nameSize}/>}
                       inputProps={{maxLength: nameSize}}
                       error={err}/>
        </Paper>
    )
}


export {QuestionCard, NameCard};