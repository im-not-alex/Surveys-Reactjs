import {Button} from "react-bootstrap";
import {Link} from "react-router-dom";

import "./404.css"

const PageNotFound = (props) => {
    return (
        <div className="background404">
            <div className="content404">
                <h1 className="title404">404</h1>
                <p className="oops">Oops... Page Not Found!</p>
                <Link to="/">
                    <Button variant="outline-dark" size="xxl">Redirect</Button>
                </Link>
            </div>
        </div>)
}

export default PageNotFound;