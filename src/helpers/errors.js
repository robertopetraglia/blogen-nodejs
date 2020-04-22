class ErrorHandler extends Error {
    constructor(statusCode, message, outputFormat, params) {
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.outputFormat = outputFormat;
        this.params = params;
    }
}

const handleErrorToRender = (err, res) => {
    const { statusCode, message, params } = err;

    let pageTitle = "";
    if (params.hasOwnProperty("pageTitle")) {
        pageTitle = params.pageTitle;
    }

    res.status(statusCode).render(statusCode, {
        pageTitle,
        errorMessage: message,
    });
};

const handleErrorToJSON = (err, res) => {
    const { statusCode, params } = err;
    res.status(statusCode).json(params);
};

const asyncErrorWrapper = fn => (...args) => fn(...args).catch(args[2]);

module.exports = {
    ErrorHandler,
    handleErrorToRender,
    handleErrorToJSON,
    asyncErrorWrapper
};
