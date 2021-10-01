import {Container, Paper} from "@material-ui/core";

export const getStyle = (style) => {
    if (style?.transform) {
        const axisLockY = `translate(0px, ${style.transform.split(',').pop()}`;
        return {
            ...style,
            transform: axisLockY,
        };
    }
    return style;
}

export const HelperText = ({error, errortext, currentsize, maxsize}) => {
    return (
        <>
            {
                error && <span>{errortext}</span>
            }
            <span style={{float: "right"}}>{currentsize + " / " + maxsize}</span>
        </>
    )
}

export const TitleLine = () => <div id={"title-line"}/>

export const PageTitleBar = ({title, options,centerTitle}) =>
    <div className={"navbar-light bg-light page-title-bar"}>
        <Container maxWidth="md" className={"d-flex "+((centerTitle && !options) ? "justify-content-center" :"justify-content-between")+" flex-grow-1"}>
            <span className={centerTitle ? "text-center" : "" }>{title}</span>
            <span className={"text-center"}>
                    {options}
                </span>
        </Container>
    </div>

export const TitleCard = ({title}) => {
    return (
        <Paper id="titleCard" elevation={3}>
            <TitleLine/>
            <div className="survey-title">{title}</div>
            <footer className={"text-danger small"}>* Required fields</footer>
        </Paper>
    )
}

export const Wrapper = ({title, children, ...other}) =>
    <Paper className={"question-card"} elevation={3} {...other}>
        <div className="question-title">{title}</div>
        {children}
    </Paper>;
export default HelperText;