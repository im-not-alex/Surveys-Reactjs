import {Divider, Grid, IconButton, MenuItem, Paper, TextField, Tooltip,} from "@material-ui/core";
import {
    CheckBox as CheckBoxIcon,
    Delete as DeleteIcon,
    DragHandle as DragHandleIcon,
    RadioButtonChecked as RadioButtonCheckedIcon,
    Subject as ParagraphIcon
} from "@material-ui/icons";
import OptionsRender from "./Options";
import {getStyle, HelperText, TitleLine} from "../../utils";
import {Draggable} from "react-beautiful-dnd";
import '../../../App.css'
import {useState} from "react";

const focusDisplay = <div id={"card-focus"}/>

const titleSize = 50;

const TitleCardEdit = ({focus, handleFocus, title, handleTitleSet, validated}) => {
    let focused = focus === "titleCard";
    let err = validated  && !title;

    return (
        <Paper id="titleCard" elevation={3} onClick={(e) => handleFocus("titleCard")}>
            <TitleLine/>
            {
                focused && focusDisplay
            }

            <TextField id="surveyTitle" placeholder="Insert the title here" value={title}
                       onChange={handleTitleSet} margin="none"
                       hiddenLabel multiline fullWidth
                       InputProps={{
                           className: "survey-title",
                       }}
                       helperText={<HelperText error={err}
                                               errortext="The title cannot be empty!"
                                               currentsize={title.length} maxsize={titleSize}/>}
                       required autoFocus inputProps={{maxLength: titleSize}}
                       error={err}/>

        </Paper>
    )
};


const answerTypes = [
    {value: 'radio', icon: <RadioButtonCheckedIcon color="action"/>, label: "Multiple choice"},
    {value: 'multiple', icon: <CheckBoxIcon color="action"/>, label: "Checkboxes"},
    {value: 'open', icon: <ParagraphIcon color="action"/>, label: "Open Answer"}
]
const questionSize = 100;
const QuestionCard = ({index, focus, handleFocus, question, validated, handlers}) => {

    const [localV, setLocalV] = useState(false);
    const {
        handleQuestionTitleSet, handleQuestionTypeSet, handleAddOption,
        handleRemoveOption, handleEditOption, handleEditMin, handleEditMax,
        handleQuestionRequiredSet, handleRemoveQuestion, onOptionDragEnd,
    } = handlers;
    let focused = focus === "question-" + question.id;
    let err = (validated || localV) && !question.title;

    const handleBlur = (e) => {
        setTimeout(() =>
            setLocalV(true), 300)
    }

    return (
        <Draggable
            draggableId={"question-" + index}
            index={index}>
            {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.draggableProps}
                     style={getStyle(provided.draggableProps.style, snapshot)}>
                    <Paper elevation={3} id={"question-" + question.id}
                           onClick={() => handleFocus("question-" + question.id)} className={"position-relative"}>
                        {
                            focused && focusDisplay
                        }
                        <div {...provided.dragHandleProps} className={"text-center"}>
                            <DragHandleIcon/>
                        </div>
                        <Grid container className={"px-5 py-3"} spacing={2}>
                            <Grid item xs={12} sm={7}>
                                <TextField id={"questionTitle" + index} placeholder={"Question Title " + (index + 1)}
                                           value={question.title}
                                           margin="none"
                                           onBlur={handleBlur}
                                           onChange={handleQuestionTitleSet} multiline
                                           hiddenLabel fullWidth
                                           helperText={<HelperText
                                               error={err}
                                               errortext="A Question Title cannot be empty!"
                                               currentsize={question.title.length} maxsize={questionSize}/>}
                                           required inputProps={{maxLength: questionSize, index}}
                                           error={err}/>
                            </Grid>
                            {
                                focused &&
                                <Grid item container xs={12} sm={5} className="MuiGrid-justify-sm-flex-end">
                                    <TextField
                                        id={"questionType" + index}
                                        select
                                        name={"" + index}
                                        value={question.type}
                                        SelectProps={{
                                            MenuProps:{
                                                anchorOrigin: {
                                                vertical: "bottom",
                                                horizontal: "left"
                                            },
                                                transformOrigin: {
                                                vertical: "top",
                                                horizontal: "left"
                                            },
                                                getContentAnchorEl: null
                                            }
                                        }}
                                        onChange={handleQuestionTypeSet}
                                        helperText="Please select answer type"
                                        variant="outlined"
                                        size="small">
                                        {answerTypes.map((option) => (
                                            <MenuItem key={"questionType" + index + option.value}
                                                      value={option.value}
                                                      disabled={option.value==='multiple' && question.options?.length===1}
                                                      dense>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    {option.icon}
                                                    <span style={{marginLeft: 5}}>
                                                                {option.label}
                                                            </span>
                                                </div>
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            }
                            <Grid item container xs={12} md={10} spacing={2} className={"pr-0"}>
                                <OptionsRender question={question}
                                               validated={validated}
                                               addOption={() => handleAddOption(index)}
                                               removeOption={(line) => handleRemoveOption(index, line)}
                                               editOption={(line, val) => handleEditOption(index, line, val)}
                                               onBlur={handleBlur}
                                               editMin={(e) => handleEditMin(index, e.target.value)}
                                               editMax={(e) => handleEditMax(index, e.target.value)}
                                               handleQuestionRequiredSet={handleQuestionRequiredSet}
                                               questionIndex={index}
                                               onDragEnd={(result) => onOptionDragEnd(index, result)}
                                               focused={focused}/>
                            </Grid>
                        </Grid>
                        <Divider/>
                        <div className={"d-flex justify-content-end pr-3"}>
                            <Tooltip title={"Delete"}>
                                <IconButton onClick={() => handleRemoveQuestion(index)} className={"text-danger"}>
                                    <DeleteIcon/>
                                </IconButton>
                            </Tooltip>
                        </div>

                    </Paper>
                </div>
            )}
        </Draggable>
    )
}

export {TitleCardEdit, QuestionCard};
