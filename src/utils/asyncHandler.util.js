const asyncHandler = (requestHandler) => {
    return (req, res, next, ...args) =>
        Promise.resolve(requestHandler(req, res, next, ...args)).catch((err) =>
            next(err)
        );
};

export { asyncHandler };
