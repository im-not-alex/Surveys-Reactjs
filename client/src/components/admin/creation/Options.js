import {
    Button,
    FormControlLabel,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Switch,
    TextField
} from "@material-ui/core";
import {
    CheckBoxOutlineBlank as CheckBoxBlankIcon,
    Clear as ClearIcon,
    DragIndicator as DragIndicatorIcon,
    RadioButtonUnchecked as RadioButtonUncheckedIcon
} from "@material-ui/icons";
import {getStyle, HelperText} from "../../utils";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {useState} from "react";

const OptionsRender = (props) => {
    const [localV,setLocalV] = useState([]);
    const {
        questionIndex,
        question,
        validated,
        addOption,
        removeOption,
        editOption,
        focused,
        editMin,
        editMax,
        handleQuestionRequiredSet,
        onDragEnd
    } = props;

    const handleBlur = (index) => {
        if(!localV.includes("option-"+index))
        setLocalV(v => {
            v.push("option-"+index)
            return [...v];
        });
    }

    if (question.type === 'open')
        return (
            <>
                <TextField value="Open answer text" hiddenLabel disabled size="small" fullWidth className={"py-2"}/>
                <FormControlLabel
                    control={<Switch checked={question.required}
                                     color={"primary"}
                                     onChange={handleQuestionRequiredSet} inputProps={{index: questionIndex}}
                                     id={"questionRequired" + questionIndex}/>}
                    label="Required"
                />
            </>
        );
    else
        return (
            <>
                <Grid item xs={12} className={"pr-0"}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId={"question-" + questionIndex + "-options"} type="options">
                            {(provided, snapshot) => (
                                <List ref={provided.innerRef} disablePadding>
                                    {
                                        question.options.map((option, index) => {
                                            let err = (validated || localV.includes("option-" + index)) && option.length === 0;
                                            return (
                                                <Draggable
                                                    key={'question-' + questionIndex + '-option-' + index}
                                                    draggableId={"question-" + questionIndex + "-option-" + index}
                                                    index={index}>
                                                    {(provided, snapshot) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps}
                                                             style={getStyle(provided.draggableProps.style, snapshot)}>
                                                            <ListItem className={"py-0 opt-item-list"} disableGutters>
                                                                <ListItemIcon className={"text-center"}>
                                                                    <span {...provided.dragHandleProps}
                                                                          className={focused ? "visible" : "invisible"}>
                                                                        <DragIndicatorIcon/>
                                                                    </span>

                                                                    {question.type === 'multiple' ?
                                                                        <CheckBoxBlankIcon color="disabled"/> :
                                                                        <RadioButtonUncheckedIcon color="disabled"/>}
                                                                </ListItemIcon>
                                                                <ListItemText>
                                                                    <TextField value={option}
                                                                               placeholder={"Option " + (index + 1)}
                                                                               id={"question-" + question.id + "-option-" + index}
                                                                               onChange={e => editOption(index, e.target.value)}
                                                                               margin="none"
                                                                               multiline hiddenLabel fullWidth
                                                                               helperText={<HelperText
                                                                                   error={err}
                                                                                   errortext="An Option cannot be empty!"
                                                                                   currentsize={option.length}
                                                                                   maxsize={100}/>
                                                                               }
                                                                               onBlur={() => handleBlur(index)}
                                                                               onFocus={event => {
                                                                                   event.target.select()
                                                                               }}
                                                                               required
                                                                               inputProps={{maxLength: 100, index}}
                                                                               error={err}/>
                                                                </ListItemText>
                                                                <ListItemSecondaryAction
                                                                    className={(focused && index>0) ? "visible" : "invisible"}>
                                                                    <IconButton edge="end"
                                                                                onClick={(e) => removeOption(index)}>
                                                                        <ClearIcon/>
                                                                    </IconButton>
                                                                </ListItemSecondaryAction>
                                                            </ListItem>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })
                                    }
                                    {provided.placeholder}
                                </List>
                            )}
                        </Droppable>
                    </DragDropContext>
                    {
                        focused &&
                        <div>
                            {question.type === 'multiple' ? <CheckBoxBlankIcon color="disabled"/> :
                                <RadioButtonUncheckedIcon color="disabled"/>}
                            <Button color="primary" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addOption();
                            }}>Add Option</Button>
                        </div>
                    }
                </Grid>
                <Grid item xs={12} sm={6} className={"d-flex justify-content-center"}>
                    <TextField
                        value={question.min}
                        onChange={editMin}
                        label="Minimum choices"
                        type="number"
                        variant="outlined"
                        size="small"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputMode='numeric'
                        InputProps={{
                            inputProps: {
                                className: "text-center",
                                style:{width:"10rem"},
                                min: 0, max: question.options.length, onKeyDown: (event) =>
                                    event.preventDefault()
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} className={"d-flex justify-content-center"}>
                    <TextField
                        value={question.max}
                        onChange={editMax}
                        label="Maximum choices"
                        type="number"
                        variant="outlined"
                        size="small"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputMode='numeric'
                        InputProps={{
                            inputProps: {
                                className: "text-center",
                                style:{width:"10rem"},
                                min: question.min || 1, max: question.options.length, onKeyDown: (event) =>
                                    event.preventDefault()
                            }
                        }}

                    />
                </Grid>
            </>
        );
}
export default OptionsRender;
