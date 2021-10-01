import {Card} from "react-bootstrap";
import {Link} from "react-router-dom";
import dayjs from "../dayjsUtils";

const colors = [
    {bg: 'primary', text: 'white'},
    {bg: 'secondary', text: 'white'},
    {bg: 'success', text: 'white'},
    {bg: 'danger', text: 'white'},
    {bg: 'warning', text: 'dark'},
    {bg: 'info', text: 'white'},
    {bg: 'light', text: 'dark'},
    {bg: 'dark', text: 'white'}];

const NoAuthCard = ({survey, styleI}) => {
    const style = colors[styleI];
    return (
        <Card bg={style.bg} text={style.text} className="position-relative">
            <Link className="run-card text-decoration-none" to={"takeSurvey/" + survey.id}>
                <svg xmlns="http://www.w3.org/2000/svg" height="60%" viewBox="0 0 24 24" width="60%" fill="#FFFFFF">
                    <path d="M0 0h24v24H0V0z" fill="none"/>
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
                <h4 className="text-white">Take Survey</h4>
            </Link>
            <Card.Header className={"font-italic"}>{survey.author}</Card.Header>
            <Card.Body>
                <Card.Title>{survey.title}</Card.Title>
                <Card.Text>number of questions: {survey.nQuestions}</Card.Text>
            </Card.Body>
            <Card.Footer className={"font-italic text-right"}>
                <small>
                    {dayjs(survey.published).format('LLLL')}
                </small>
            </Card.Footer>

        </Card>
    )
}

export default NoAuthCard;