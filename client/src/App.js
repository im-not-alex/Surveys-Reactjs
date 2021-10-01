import './App.css';
import {Route, Switch} from "react-router-dom";
import {SurveyCreation, SurveyForm, SurveysList} from './components';
import PageNotFound from "./components/PageNotFound";
import 'bootstrap/dist/css/bootstrap.min.css';
import AppBar from "./components/AppBar";
import LogIn from "./components/LogIn";
import {StylesProvider} from "@material-ui/core";
import AdminSurveys from "./components/admin/AdminSurveys";
import AnswerDisplay from "./components/admin/AnswerDisplay";
import "@fontsource/roboto";
import Snackbar from '@material-ui/core/Snackbar';
import {useState} from "react";
import {Alert} from "@material-ui/lab";

/*eslint no-extend-native: ["off", { "exceptions": ["Object"] }]*/
Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

//REMOVING findDOMNode DEPRECATED
let ce = console.error;
console.error = function (_) {
    if (!Object.values(arguments).includes("findDOMNode"))
        ce.apply(console, arguments)
}
const initFeedback = {open:false, severity:"error", text:""}
const App = () => {
    const [feedback, setFeedback] = useState(initFeedback)
    const handleFeedbackClose = () => setFeedback(f=> ({...f,open:false}))
    const handleFeedbackOpen = (severity, text) => setFeedback({open:true,severity,text})
    return (
        <div>
            <StylesProvider injectFirst>
                <Switch>
                    <Route path="/takeSurvey/:sId" render={(props) => <><AppBar/><SurveyForm {...props} openFeedback={handleFeedbackOpen}/></>}/>
                    <Route path="/admin" exact render={(props) => <><AppBar/><AdminSurveys {...props}/></>}/>
                    <Route path="/admin/createSurvey" exact render={(props) => <><AppBar/><SurveyCreation {...props} openFeedback={handleFeedbackOpen}/></>}/>
                    <Route path="/admin/survey/:sId/answer/" render={(props) => <><AppBar/><AnswerDisplay {...props}/></>}/>
                    <Route path="/login" exact render={(props) => <><AppBar/><LogIn {...props}/></>}/>
                    <Route path="/" exact render={(props) => <><AppBar/><SurveysList {...props}/></>}/>
                    <Route component={PageNotFound}/>
                </Switch>
                <Snackbar open={feedback.open} autoHideDuration={5000} onClose={handleFeedbackClose}>
                    <Alert elevation={6} variant="filled" onClose={handleFeedbackClose} severity={feedback.severity}>
                        {feedback.text}
                    </Alert>
                </Snackbar>
            </StylesProvider>
        </div>
    );
}

export default App;
