// A utility function to wrap async controllers so we don't have to write try-catch blocks everywhere
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
