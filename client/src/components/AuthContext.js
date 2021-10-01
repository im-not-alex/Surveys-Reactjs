import React from 'react';
import API from "../Api";

const AuthContext = React.createContext();

const initState = {
    status: 'pending',
    error: null,
    user: null,
}

const AuthProvider = (props) => {
    const [state, setState] = React.useState(initState);
    const [showW, setShowW] = React.useState(false);

    const fetchUser = async (user = undefined) => {
        let answ, response;
        try {
            response = await (user ? API.logIn(user) : API.getUserInfo());
            answ = await response.json();
        } catch (e) {
            answ = null;
        } finally {
            if (response.ok) {
                setState({status: 'success', error: null, user: answ});
            } else if (response.status === 401) {
                setState({
                    status: user ? 'errorUnauthorized' : 'unauthorized',
                    error: answ?.message || response.statusText,
                    user: null
                });
            } else
                setState({status: 'error', error: answ?.error || response.statusText, user: null});
        }
    }

    const logOut = async () => {
        const response = await API.logOut();
        if (!response?.ok && response)
            console.log(response?.statusText);
        setState({status: 'unauthorized', error: null, user: null});
    }

    React.useEffect(() => {
        fetchUser();
    }, []);

    React.useEffect(() => {
        if (state.user !== null)
            setShowW(true);
    }, [state]);

    React.useEffect(() => {
        if (showW === true)
            window.setTimeout(
                () => setShowW(false), 3000
            )

    }, [showW])

    const renderSwitch = (s, welcome) => {
        switch (s.status) {
            case 'pending' :
                return 'Loading...';

            case 'error':
                return (
                    <div>
                        Oh no
                        <div>
                            <pre>{state.error}</pre>
                        </div>
                    </div>
                )
            default :
                return props.children;
        }
    }
    return (
        <AuthContext.Provider value={{...state, logIn: (user) => fetchUser(user), logOut}}>
            {
                renderSwitch(state)
            }
        </AuthContext.Provider>
    )
}

const useAuthState = () => {
    const state = React.useContext(AuthContext)
    const isPending = state.status === 'pending'
    const isError = state.status === 'error'
    const isSuccess = state.status === 'success'
    const isUnauthorized = state.status === 'unauthorized'
    const isUnAuthAccess = state.status === 'errorUnauthorized'
    const isAuthenticated = isSuccess && state.user
    return {
        ...state,
        isPending,
        isError,
        isSuccess,
        isUnauthorized,
        isUnAuthAccess,
        isAuthenticated,
    }
}


export default AuthProvider;
export {useAuthState};