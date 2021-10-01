import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import QuestionAnswerIcon from "@material-ui/icons/QuestionAnswer";
import {Link, useLocation} from 'react-router-dom';
import {useAuthState} from "./AuthContext";
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import {Button} from "@material-ui/core";

const AppBar = (props) => {
    const location = useLocation();
    const auth = useAuthState();

    return (
        <Navbar sticky="top" bg="light" variant="light">
            <Navbar.Brand>
                <QuestionAnswerIcon/>{' '}HiSurveys
            </Navbar.Brand>
            <Nav className="mr-auto" activeKey={location.pathname} variant="pills">
                <Nav.Item>
                    <Nav.Link eventKey={"/"} as={Link} className={"text-decoration-none"} to={"/"}>{auth.isAuthenticated? "Public Area": "Home"}</Nav.Link>
                </Nav.Item>
            </Nav>
            <Navbar.Collapse className={"justify-content-end "+(location.pathname==="/login" ? "invisible": "visible")}>
                {auth.isAuthenticated ?
                    <NavDropdown title={auth.user.name} id="admin-dropdown" alignRight active as={Button}
                                 className={"no-text-transform"}>
                        <NavDropdown.Item active={location.pathname === "/admin/createSurvey"}
                                          to={"/admin/createSurvey"}
                                          as={location.pathname === "/createSurvey" ? "div" : Link}
                                          className={"text-right"}>New Survey</NavDropdown.Item>
                        <NavDropdown.Item active={location.pathname === "/admin"} to={"/admin"}
                                          as={Link} className={"text-right"}>My Surveys</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item className={"text-right"} onClick={(e) => auth.logOut()}>Log
                            Out<ExitToAppRoundedIcon className={"justify-content-center ml-2"}/></NavDropdown.Item>

                    </NavDropdown>
                    :
                    <Navbar.Text>
                        <Link to="/login">
                            <Button endIcon={<AccountCircleRoundedIcon/>}>Admin LogIn</Button>
                        </Link>
                    </Navbar.Text>
                }
            </Navbar.Collapse>
        </Navbar>
    )
}

export default AppBar;