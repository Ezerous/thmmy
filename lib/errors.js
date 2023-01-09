//Error codes
const EPARSE = 'EPARSE';
const EAUTH = 'EAUTH';
const EINVALIDSESC = 'EINVALIDSESC';
const EOTHER = 'EOTHER';

/**
 * Sets an error code (implicitly or not) to the given error
 */
function setErrorCode(error, code) {
    if(code)
        error.code = code;
    else if(!error.code) {
        if (error.error)    // Connection errors
            error.code = error.error.code;
        else
            error.code = EOTHER;
    }
    return error;
}

export {setErrorCode, EAUTH, EPARSE, EINVALIDSESC, EOTHER};
