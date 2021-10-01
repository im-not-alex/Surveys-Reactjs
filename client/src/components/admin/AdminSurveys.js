import {useAuthState} from "../AuthContext";
import {useEffect, useState} from "react";
import API from "../../Api";
import {Link, Redirect} from "react-router-dom";
import {
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fab,
    IconButton,
    Tooltip
} from "@material-ui/core";
import {Add as AddIcon} from "@material-ui/icons";
import {Table} from "react-bootstrap";
import {PageTitleBar} from "../utils";
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AnswersIcon from '@material-ui/icons/LibraryBooks';
import SurveyDisplay from "./SurveyDisplay";
import dayjs from "../dayjsUtils";

const initState = {loading: true, list: [], error: null};
const AdminSurveys = (props) => {
    const auth = useAuthState();
    const [surveys, setSurveys] = useState(initState);
    const [publishing, setPublishing] = useState([]);
    const [openPreview, setOpenPreview] = useState({open: false, survey: null});
    const handleClosePreview = () => setOpenPreview({open: false, survey: null});

    useEffect(() => {
        if (!auth.isPending) {
            setSurveys(initState);
            API.getAuthSurveys().then(l => {
                if(l) setSurveys({loading: false, list: l, error: null})
                else setSurveys({loading: false, list: [], error: null})
            }).catch(e => ({loading: false, list: [], error: e}))
        }
    }, [auth.user])

    const handlePublish = (id) => {
        setPublishing(p => p.concat(id));
        API.publishSurvey(id).then(res =>
            setSurveys(s => ({...s, list: s.list.map(e => e.id === res.id ? res : e)}))
        ).catch(e => console.log(e)).finally(() => setPublishing(p => {
            let arr = [...p];
            const index = arr.indexOf(id);
            if (index > -1)
                arr.splice(index, 1);
            return arr;
        }));
    }

    const handleOpenPreview = (index) => {
        if (!surveys.list[index].questions) {
            API.getAuthSurveyQuestions(surveys.list[index].id)
                .then(({questions}) => {
                    setSurveys(s => {
                        let arr = s.list;
                        arr[index].questions = questions;
                        return {...s, list: arr}
                    })
                    let s = surveys.list[index];
                    s.questions = questions;
                    setOpenPreview({open: true, survey: s});
                }).catch(e => ({...e, error: e}));
        } else
            setOpenPreview({open: true, survey: surveys.list[index]})

    }

    return (
        !auth.isAuthenticated ? <Redirect to={"/login"}/> :
            surveys.loading ? <div>loading</div> :
            <div>
                <PageTitleBar title={"My Surveys"}/>
                {
                    surveys.list.length>0 ?

                        <><Container maxWidth={"md"}>
                            <Table striped bordered hover responsive={"md"}  className={"mb-5"}>
                                <thead>
                                <tr>
                                    <th className={"w-25"}>Title</th>
                                    <th className={"text-center"}>#Responses</th>
                                    <th className={"text-right"}>Published</th>
                                    <th className={"text-right"}>actions</th>
                                </tr>
                                </thead>
                                <tbody>

                                {
                                    !surveys.loading &&
                                    surveys.list.map((s, index) => {
                                        const {id, title, responses, published} = s;
                                        return (<tr key={'my-survey-' + id}>
                                            <td className={"title-in-table"}>{title}</td>
                                            <td className={"text-center p-0"}>{responses ? <div>{responses}</div> :
                                                <div className={"font-italic"}>none</div>}</td>
                                            <td className={"text-right"}>{published ? dayjs(published).format('LLL') :
                                                <Button className={"p-0 underline-text position-relative"} color="secondary"
                                                        onClick={() => handlePublish(id)} disabled={publishing.includes(id)}>Click
                                                    to publish{publishing.includes(id) &&
                                                    <CircularProgress className={"position-absolute align-content-center"}
                                                                      size={18}/>}</Button>
                                            }</td>
                                            <td className={"text-center p-0"}>
                                                <Tooltip title={"Preview"}>
                                                    <IconButton className={"text-info"}
                                                                onClick={() => handleOpenPreview(index)}>
                                                        <VisibilityIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                {
                                                    published ? (responses ? <Tooltip title={"View Answers"}>
                                                            <Link to={"admin/survey/" + s.id + "/answer/"}>
                                                                <IconButton className={"text-primary"}>
                                                                    <AnswersIcon/>
                                                                </IconButton>
                                                            </Link>
                                                        </Tooltip> : null)
                                                        : (
                                                            <>
                                                                <Tooltip title={"Edit"}>
                                                                    <IconButton className={"text-warning"}>
                                                                        <EditIcon/>
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title={"Delete"}>
                                                                    <IconButton className={"text-danger"}>
                                                                        <DeleteIcon/>
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        )
                                                }

                                            </td>
                                        </tr>)
                                    })
                                }
                                </tbody>
                            </Table>
                        </Container>
                        <Dialog fullWidth maxWidth={"md"} open={openPreview.open} onClose={handleClosePreview} scroll={"paper"}>
                            <DialogTitle>Survey Preview</DialogTitle>
                            <DialogContent dividers={true}>
                                <DialogContentText component={"div"}>
                                    <SurveyDisplay survey={openPreview.survey}/>
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClosePreview} color="secondary">
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog></>
                    : <div className={"text-center font-italic"}><h5>You have not published a survey yet!</h5></div>
                }
                <Link to={"/admin/createSurvey"}>
                    <Fab variant="extended" color="secondary" size="large"
                         id="add-survey">
                        <AddIcon/>
                        Survey
                    </Fab>
                </Link>
            </div>

    )
}
export default AdminSurveys;