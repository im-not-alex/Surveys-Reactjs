import {useAuthState} from "./AuthContext";
import {useState} from "react";
import {Button, Container, InputAdornment, TextField} from "@material-ui/core";
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import {Redirect} from "react-router-dom";
import {PageTitleBar} from "./utils";


const emailRFC5322 = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/


const LogIn = (props) => {
    const auth = useAuthState();
    const [validated, setValidated] = useState(true);
    const [user, setUser] = useState({email: "", password: ""});
    const [errors, setErrors] = useState({email: false, password: false});

    const handleSubmit = async (event) => {
        event.preventDefault();
        let ev = !validateFields("email",user.email);
        let pv = !validateFields("password",user.password);
        if (ev && pv) {
            await auth.logIn(user);
        } else setValidated(true);

    }

    const setField = (e) => {
        setUser(u => ({...u, [e.target.name]: e.target.value}))
        validateFields(e.target.name,e.target.value);
    }
    const validateFields = (target,value) => {
        let err1=false,err2=false;
        if (target === "email") {
            err1 = !emailRFC5322.test(value)
            setErrors(err => ({
                ...err,
                email: err1
            }))
        }
        if (target === "password") {
            err2 = !value || value.length===0;
            setErrors(err => ({...err, password: err2}))
        }
        return err1 || err2;
    }
    const handleBlur = (e) => {
        if(validated!== true)
            setValidated(v => (
                v ? {...v, [e.target.name]: true} : {[e.target.name]: true}))
    }

    return (
        auth.isAuthenticated ? <Redirect to={"/admin"}/> :
            <>
                <PageTitleBar title={"Log In"}/>

                <Container maxWidth={"md"}>
                <form noValidate onSubmit={handleSubmit}>
                    <label htmlFor="email">Email Address</label>
                    <TextField name="email" required autoFocus placeholder="Enter your email"
                               variant="outlined" fullWidth onChange={setField} error={(validated || validated.email) && errors.email}
                               helperText={(validated || validated.email) && errors.email ? (user.email ? "Invalid email format!" : "Email field cannot be empty!") : null}
                               onBlur={handleBlur} value={user.email} type="email" id="email"
                               InputProps={{
                                   endAdornment: errors.email &&
                                       <InputAdornment position="end"><ErrorOutlineIcon color="error"/></InputAdornment>
                               }}/>
                    <br/>
                    <label htmlFor="password">Password</label>
                    <TextField name="password" required placeholder="Enter your password"
                               variant="outlined" fullWidth onChange={setField} error={(validated || validated.password) && errors.password}
                               helperText={(validated || validated.password) && errors.password ? "Password field cannot be empty!" : null}
                               onBlur={handleBlur} value={user.password} type="password" id="password"
                               InputProps={{
                                   endAdornment: errors.password &&
                                       <InputAdornment position="end"><ErrorOutlineIcon color="error"/></InputAdornment>
                               }}/>
                    <hr className="rounded"/>
                    <div className={auth.isUnAuthAccess ? "text-danger visible" : "invisible"}>
                        Wrong email/password combination!
                    </div>
                    <Button type="submit" size={"large"} className="float-right bg-success text-white">
                        Log In
                    </Button>
                </form>
            </Container>
            </>

    )
}

export default LogIn;
