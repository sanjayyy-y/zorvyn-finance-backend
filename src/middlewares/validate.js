const validate = schema => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    // Assuming ZodError
    const formattedErrors = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    return res.status(400).json({
      status: 'fail',
      message: 'Validation Error',
      errors: formattedErrors,
    });
  }
};

module.exports = validate;
